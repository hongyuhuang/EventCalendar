import dotenv from "dotenv";
import express from "express";
import basicAuth from "express-basic-auth";
import mysql from "mysql2/promise";
import { RowDataPacket } from "mysql2/promise";
import { User, Event } from "./entities";
// import bodyParser from 'body-parser';  // for json inputs
import multer from "multer"; //for Form inputs
import { format } from "date-fns";
import { OkPacket } from "mysql2";
import bodyParser from "body-parser";
const assert = require("assert");

const acl = require("express-acl"); // For role based auth

dotenv.config();
const app = express();
// app.use(bodyParser.json());  //for json inputs
app.use(multer().none()); //for Form inputs

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

app.get("/test", (req, res) => {
    res.send("Hello from express!");
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
 * Creates a new event
 */
app.post("/event", async (req, res) => {
    try {
        let { title, location, startDate, endDate, description } = req.body;
        startDate = format(new Date(startDate), "yyyy-MM-dd");
        endDate = format(new Date(endDate), "yyyy-MM-dd");
        await pool.query<Event[]>(
            `INSERT INTO EVENT (title, location, startDate, endDate, description)
             VALUES (?, ?, ?, ?, ?)`,
            [title, location, startDate, endDate, description]
        );
    } catch (err) {
        console.log(err);
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

/**
 * Assigns a user to a particular event
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

        if ((eventResults as RowDataPacket[]).length === 0) {
            return res.status(404).send("Event not found");
        }

        // Check if the user exists
        const userResults = await pool.query<User[]>(
            `SELECT *
                     FROM USER
                     WHERE userId = ?`,
            [userId]
        );

        if ((userResults as RowDataPacket[]).length === 0) {
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
        if ((attendanceResults as RowDataPacket[]).length > 0) {
            return res.send("User is already assigned to the event");
        }

        // Insert new attendance record
        await pool.query<OkPacket>(
            `INSERT INTO ATTENDANCE_RECORD (userId, eventId)
                                     VALUES (?,?)`,
            [userId, eventId]
        );
        res.send("User assigned to event successfully");
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

/**
 * Creates a new user
 */
app.post("/user", async (req, res) => {
    try {
        const { firstName, lastName, isAdmin, email, password } = req.body;
        const [results] = await pool.query<User[]>(
            "INSERT INTO USER (firstName, lastName, isAdmin, email, password) VALUES (?, ?, ?, ?, ?)",
            [firstName, lastName, isAdmin, email, password]
        );
        res.send(results);
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
        const [results] = await pool.query<User[]>(
            `SELECT *
             FROM USER`
        );
        res.send(results);
    } catch (err) {
        console.log(err);
        res.status(500).send("An error occurred while getting the users");
    }
});

/**
 * Returns a photo for a particular user.
 */
app.get("/user/:username/photo", (req, res) => {});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
