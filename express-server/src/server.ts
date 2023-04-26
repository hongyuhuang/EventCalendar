import dotenv from "dotenv";
import express from "express";
import basicAuth from "express-basic-auth";
import mysql from "mysql2/promise";
import { RowDataPacket } from "mysql2/promise";
import { User, Event } from "./entities";
import multer from "multer"; //for Form inputs
import { format } from "date-fns";
import { OkPacket } from "mysql2";
import bodyParser from "body-parser";
import { ResultSetHeader } from "mysql2";
const assert = require("assert");

const acl = require("express-acl"); // For role based auth

dotenv.config();
const app = express();

const cors = require("cors");
app.use(
    cors({
        origin: "http://localhost:3000",
    })
);

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});

app.use(bodyParser.json()); //for json inputs

app.use(multer().none()); //for Form inputs

const PORT = 3001;

app.get("/", (req, res) => {
    res.redirect("/test");
});

app.get("/users", (req, res) => {
    pool.query<User[]>("SELECT * FROM USER", function (err, results, fields) {
        res.json(results);
    });
});

/**
 * Registers a new user.
 *
 * Put at the top of express file to skip auth
 *
 * Intended to be used with the 'create-account' button on the front end
 *
 * As such, this route provides restricted access to what can be inserted into the DB - e.g. no users with admin privileges can be created
 */
app.post("/register", async (req, res) => {
    try {
        await pool.query<OkPacket>(
            `INSERT INTO USER (firstName, lastName, isAdmin, email, password)
                  VALUES (?, ?, ?, ?, ?)`,
            [
                req.body.firstName,
                req.body.lastName,
                0,
                req.body.email,
                req.body.password,
            ]
        );
        res.send("User registered successfully");
    } catch (e) {
        console.log(e);
        res.status(500).send("An error occurred while registering the user");
    }
});

// Adding in basic auth
app.use(
    basicAuth({
        authorizer: authorize,
        authorizeAsync: true,
        unauthorizedResponse: "Authentication failed",
    }),
    assignRequestRole
);

/**
 * Assigns a role to a request, used for role auth
 *
 * @param req
 * @param res
 * @param next
 */
async function assignRequestRole(req, res, next) {
    // @ts-ignore
    const role = await getUserRole(req.auth.user, req.auth.password);
    if (role === null) {
        res.status(500).send("Internal server error");
    }
    // @ts-ignore
    req.role = role;
    next();
}

/**
 * Gets the role for a user.
 *
 * Used for role based authentication/authorization
 *
 * @param email string for the role of a user
 * @param password string for the password of a user
 * @return string for the role of a user
 */
async function getUserRole(email: string, password: string): Promise<string> {
    try {
        const [results] = await pool.query<User[]>(
            `SELECT *
             FROM USER
             WHERE email = ?
               AND password = ?`,
            [email, password]
        );
        assert(results.length == 1, "There should be exactly one user found");
        return Boolean(results[0].isAdmin) ? "admin" : "user";
    } catch (err) {
        console.error(err);
        return null;
    }
}

/**
 * Basic Auth authorizing function a user using a username and password combination
 *
 * @param email string for the email of the user
 * @param password string for a user's project
 * @param callback used for async auth
 * @return void, callback handles the result
 */
async function authorize(
    email: string,
    password: string,
    callback: (err: Error | null, authorized: boolean) => void
): Promise<void> {
    try {
        const [results] = await pool.query<User[]>(
            `SELECT *
             FROM USER
             WHERE email = ?
               AND password = ?`,
            [email, password]
        );
        return callback(null, results.length === 1);
    } catch (err) {
        console.error(err);
        return callback(err, false);
    }
}

// Adding in ACL
acl.config(
    {
        roleSearchPath: "role",
        baseUrl: "/",
    },
    {
        status: "Access Denied",
        message: "You do not have permission to access this resource",
    }
);

app.use(acl.authorize);

/**
 * Handles login of the React app.
 *
 * Basically just returns whether a user is an admin or not that a user has, given the headers. It is already assumed that their credentials are valid.
 */
app.get("/login", (req, res) => {
    res.status(200).json({
        // @ts-ignore
        isAdmin: req.role === "admin",
    });
});

/*
 * Route to return event with a given id
 */
app.get("/event/:id", async (req, res) => {
    const eventId = req.params.id;

    try {
        const [results] = await pool.query<Event[]>(
            "SELECT * FROM EVENT WHERE eventId = ?",
            [eventId]
        );
        if (results.length === 0) {
            res.status(404).send("Event not found");
        } else {
            const event = results[0];
            res.json(event);
        }
    } catch (err) {
        console.error(err);
        res.redirect("/404");
    }
});

/**
 * Route to get all events
 */
app.get("/event", async (req, res) => {
    try {
        const [results] = await pool.query<Event[]>(
            `SELECT *
             FROM EVENT;`
        );

        res.send(results);
    } catch (err) {
        console.log(err);
        res.status(500).send("An error occurred while getting the events");
    }
});

/**
 * Creates a new event
 */
app.post("/event", async (req, res) => {
    try {
      const { title, location, startDate, endDate, description } = req.body;
      const formattedStartDate = format(new Date(startDate), "yyyy-MM-dd HH:mm:ss");
      const formattedEndDate = format(new Date(endDate), "yyyy-MM-dd HH:mm:ss");
  
      const [result] = await pool.query<ResultSetHeader>(
        "INSERT INTO EVENT (title, location, startDate, endDate, description) VALUES (?, ?, ?, ?, ?)",
        [title, location, formattedStartDate, formattedEndDate, description]
      );
  
      const { insertId } = result;
      res.status(201).send({ eventId: insertId });
    } catch (err) {
      console.log(err);
      res.status(500).send("An error occurred while creating the event");
    }
  });

/**
 * Deletes an event by ID
 */
app.delete("/event/:eventId", async (req, res) => {
    try {
      const { eventId } = req.params;
      await pool.query("DELETE FROM EVENT WHERE eventId = ?", [eventId]);
      res.send(`Event with ID ${eventId} deleted`);
    } catch (err) {
      console.log(err);
      res.status(500).send("An error occurred while deleting the event");
    }
  });
  
/**
 * Performs a partial update on an event
 */
app.patch("/event/:eventId", async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const { title, location, startDate, endDate, description } = req.body;
        const formattedStartDate = format(new Date(startDate), "yyyy-MM-dd");
        const formattedEndDate = format(new Date(endDate), "yyyy-MM-dd");

        const findResults = await pool.query<Event[]>(
            `SELECT *
             FROM EVENT
             WHERE eventId = ?`,
            [eventId]
        );

        if ((findResults as RowDataPacket[]).length === 0) {
            return res.status(404).send("Event not found");
        }

        await pool.query<OkPacket>(
            `UPDATE EVENT
             SET title = ?,
                 location = ?,
                 startDate = ?,
                 endDate = ?,
                 description = ?
             WHERE eventId = ?`,
            [
                title,
                location,
                formattedStartDate,
                formattedEndDate,
                description,
                eventId,
            ]
        );
        res.send("Event updated successfully");
    } catch (err) {
        console.log(err);
        res.status(500).send("An error occurred while updating the event");
    }
});

// EXAPLES STUFF

// app.get("/user/:id", async (req, res) => {
//     try {
//         const [results] = await pool.query<User[]>(
//             `SELECT *
//              FROM USER
//              WHERE userId = ?`,
//             [req.params.id]
//         );
//         if (
//             typeof results === "undefined" ||
//             (results as RowDataPacket[]).length === 0
//         ) {
//             res.status(404).send("User not found");
//         } else {
//             res.send(results[0]);
//         }
//     } catch (err) {
//         console.log(err);
//         res.status(500).send("An error occurred while getting the user");
//     }
// });


/**
 * Assigns a user to a particular vent
 */
app.post("/event/:eventId/assign/:userId", async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const userId = req.params.userId;

        // Check if the event exists
        const eventResults = await pool.query<Event[]>(
            `SELECT *
             FROM EVENT
             WHERE eventId = ?`,
            [eventId]
        );

        if ((eventResults as RowDataPacket[])[0].length === 0) { //might need a [0] before length.
            return res.status(404).send("Event not found");
        }

        // Check if the user exists
        const userResults = await pool.query<User[]>(
            `SELECT *
                     FROM USER
                     WHERE userId = ?`,
            [userId]
        );

        if ((userResults as RowDataPacket[])[0].length === 0) { //might need a [0] before length.
            return res.status(404).send("User not found");
        }

        // If both event and user exist, check if attendance record already exists
        const attendanceResults = await pool.query(
            `SELECT *
                             FROM ATTENDANCE_RECORD
                             WHERE userId = ?
                               AND eventId = ?`,
            [userId, eventId]
        );

        // Check if attendance record already exists
        if ((attendanceResults as RowDataPacket[])[0].length > 0) {
            return res.send("User is already assigned to the event");
        }

        // Insert new attendance record
        await pool.query<OkPacket>(
            `INSERT INTO ATTENDANCE_RECORD (userId, eventId)
                                     VALUES (?,?)`,
            [userId, eventId]
        );
        res.status(201).send("User assigned to event successfully");
    } catch (err) {
        console.log(err);
        res.status(500).send(
            "An error occurred while assigning the user to the event"
        );
    }
});

/*
 * Route to return all events for a given user
 *
 * Events can be filtered to come after a specific date-time
 */
app.get("/user/:userId/events", async (req, res) => {
    const userId = req.params.userId;
    const afterDateTime = req.query.afterDateTime as string;

    let query = `SELECT e.eventId, e.title, e.location, e.startDate, e.endDate, e.description
                 FROM EVENT e
                          INNER JOIN ATTENDANCE_RECORD ar ON e.eventId = ar.eventId
                 WHERE ar.userId = ?`;
    let values = [userId];

    if (afterDateTime) {
        query += ` AND e.startDate >= ?`;
        values.push(afterDateTime);
    }

    try {
        const [results] = await pool.query<[]>(query, values);

        if (results.length === 0) {
            res.status(404).send("Event not found");
        } else {
            res.send(results);
        }
    } catch (err) {
        console.log(err);
        res.status(500).send("An error occurred while fetching events");
    }
});

// /**
//  * Creates a new user  >>>  THIS IS THE OLD ROUTE. <<<
//  */
// app.post("/user", async (req, res) => {
//     try {
//         const { firstName, lastName, isAdmin, email, password } = req.body;
//         const [results] = await pool.query<User[]>(
//             "INSERT INTO USER (firstName, lastName, isAdmin, email, password) VALUES (?, ?, ?, ?, ?)",
//             [firstName, lastName, isAdmin, email, password]
//         );
//         res.send(results);
//     } catch (err) {
//         console.log(err);
//         res.status(500).send("An error occurred while creating the user");
//     }
// });

/**
 * Creates a new user  >>> THIS IS THE NEW ROUTE <<<
 */

app.post("/user", async (req, res) => {
    try {
        const { firstName, lastName, isAdmin, email, password } = req.body;
        const [result] = await pool.query<ResultSetHeader>(
            "INSERT INTO USER (firstName, lastName, isAdmin, email, password) VALUES (?, ?, ?, ?, ?)",
            [firstName, lastName, isAdmin, email, password]
        );
        const { insertId } = result;
        res.send({ userId: insertId });
    } catch (err) {
        console.log(err);
        res.status(500).send("An error occurred while creating the user");
    }
});

/**
 * Get a user by ID
 */
app.get("/user/:id", async (req, res) => {
    try {
        const [results] = await pool.query<User[]>(
            `SELECT *
             FROM USER
             WHERE userId = ?`,
            [req.params.id]
        );
        if (
            typeof results === "undefined" ||
            (results as RowDataPacket[]).length === 0
        ) {
            res.status(404).send("User not found");
        } else {
            res.send(results[0]);
        }
    } catch (err) {
        console.log(err);
        res.status(500).send("An error occurred while getting the user");
    }
});

/**
 * Route to get all users
 */
app.get("/user", async (req, res) => {
    try {
        const includeAdmins = Boolean(req.query.includeAdmins);

        const [results] = await pool.query<User[]>(
            `SELECT *
             FROM USER
             WHERE isAdmin = ? OR isAdmin = 0`,
            [includeAdmins]
        );

        res.send(results);
    } catch (err) {
        console.log(err);
        res.status(500).send("An error occurred while getting the users");
    }
});

/**
 * Delete a user by ID
 */
app.delete("/user/:id", async (req, res) => {
    try {
        const [results] = await pool.query<ResultSetHeader>(
            `DELETE FROM USER
             WHERE userId = ?`,
            [req.params.id]
        );
        if (results.affectedRows === 0) {
            res.status(404).send("User not found");
        } else {
            res.sendStatus(204);
        }
    } catch (err) {
        console.log(err);
        res.status(500).send("An error occurred while deleting the user");
    }
});

/**
 * Returns a photo for a particular user.
 */
app.get("/user/:username/photo", (req, res) => {});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = {
    app: app,
};
