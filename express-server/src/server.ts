import dotenv from "dotenv";
import express from "express";
import basicAuth from "express-basic-auth";
import mysql from 'mysql2';
import { RowDataPacket } from 'mysql2/promise';
import { User, Event } from './entities';
// import bodyParser from 'body-parser';  // for json inputs
import multer from 'multer';  //for Form inputs
import { format } from 'date-fns';

dotenv.config();
const app = express();
// app.use(bodyParser.json());  //for json inputs
app.use(multer().none())  //for Form inputs

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

app.get('/test', (req, res) => {
    pool.query<User[]>(
        'SELECT * FROM USER',
        function (err, results, fields) {
            res.send(results)
            console.log(results[0])

            for (const user of results) {
                console.log(user.email);
            }
        })
});

app.get('/', (req, res) => {
    res.redirect('/test');
});


/**
 * Authorizes a user using a username and password combination
 *
 * @param username string for the name of the user
 * @param password string for a user's project
 * @return boolean for if a user is authorized or not
 */
async function authorize(username: string, password: string): Promise<boolean> {
  // TODO

  /*

    Query DB

    TODO, username needs to be appropriately escaped

    authorization should be based on what can be accessed, can be done on the route level.

    Return result of the query

     */

  return true;
}

/*
 * Route to return event with a given id
 */
app.get("/event/:id", (req, res) => {
    const eventId = req.params.id;

    try {
        pool.query<Event[]>(
            `SELECT * FROM EVENT WHERE eventId = ${eventId}`,
            function (err, results, fields) {
                console.log(results)

                if (results.length === 0) {
                    res.status(404).send('Event not found');
                } else {
                    const event = results[0];
                    res.json(event);
                }
            });
    } catch (err) {
        console.error(err);
        res.redirect('/404');
    }
});

/**
 * Creates a new event
 */
app.post("/event", (req, res) => {
    try {
        var { title, location, startDate, endDate, description} = req.body;
        startDate = format(new Date(startDate), 'yyyy-MM-dd');
        endDate = format(new Date(endDate), 'yyyy-MM-dd');
        pool.query<Event[]>(
            `INSERT INTO EVENT (title, location, startDate, endDate, description) VALUES (${title}, ${location}, "${startDate}", "${endDate}", ${description})`,
            function (err, results, fields) {}
        )
    }catch (err) {
        console.log(err);
    }
 });

/**
 * Performs a partial update on an event
 */
app.patch("/event/:eventId", (req, res) => {
    try {
        const eventId = req.params.eventId;
        const { title, location, startDate, endDate, description} = req.body;
        const formattedStartDate = format(new Date(startDate), 'yyyy-MM-dd');
        const formattedEndDate = format(new Date(endDate), 'yyyy-MM-dd');
        
        pool.query<Event[]>(
            `UPDATE EVENT SET title = ${title}, location = ${location}, startDate = ${formattedStartDate}, endDate = ${formattedEndDate}, description = ${description} WHERE eventId = ${eventId}`,
            function (err, results, fields) {
                if (err) throw err;
                res.send("Event updated successfully");
            }
        );
    } catch (err) {
        console.log(err);
        res.status(500).send("An error occurred while updating the event");
    }
});


/**
 * Assigns a user to a particular event
 */
app.post("/event/:eventId/assign/:userId", (req, res) => {
  try {
    const eventId = req.params.eventId;
    const userId = req.params.userId;

    // Check if the event exists
    pool.query<Event[]>(
      `SELECT * FROM EVENT WHERE id=${eventId}`,
      function (err, eventResults, fields) {
        if (err) throw err;
        if (eventResults.length === 0) {
          return res.status(404).send("Event not found");
        }

        // Check if the user exists
        pool.query<User[]>(
          `SELECT * FROM USER WHERE id=${userId}`,
          function (err, userResults, fields) {
            if (err) throw err;
            if (userResults.length === 0) {
              return res.status(404).send("User not found");
            }

            // If both event and user exist, assign the user to the event
            pool.query(
              `INSERT INTO ATTENDANCE_RECORD (userId, eventId) VALUES (${userId}, ${eventId})`,
              function (err, results, fields) {
                if (err) throw err;
                res.send("User assigned to event successfully");
              }
            );
          }
        );
      }
    );
  } catch (err) {
    console.log(err);
    res.status(500).send("An error occurred while assigning the user to the event");
  }
});


/*
 * Route to return all events for a given user
 *
 * Events can be filtered to come after a specific date-time
 */
app.get("/user/:userId/events", (req, res) => {
    const userId = req.params.userId;
    const afterDateTime = req.query.afterDateTime;
  
    let query = `SELECT e.eventId, e.title, e.location, e.startDate, e.endDate, e.description 
                 FROM EVENT e 
                 INNER JOIN ATTENDANCE_RECORD ar ON e.eventId = ar.eventId 
                 WHERE ar.userId = ${userId}`;
  
    if (afterDateTime) {
      query += ` AND e.startDate >= '${afterDateTime}'`;
    }
  
    pool.query(query, function (err, results, fields) {
      if (err) {
        console.log(err);
        res.status(500).send("An error occurred while fetching events");
      } else {
        res.send(results);
      }
    });
  });
  

/**
 * Creates a new user
 */
app.post("/user", (req, res) => {
    try {
      const { firstName, lastName, isAdmin, email, password } = req.body;
  
      pool.query<User[]>(
        `INSERT INTO USER (firstName, lastName, isAdmin, email, password) VALUES (${firstName}, ${lastName}, ${isAdmin}, ${email}, ${password})`,
        function (err, results, fields) {
          if (err) throw err;
          res.send(results);
        }
      );
    } catch (err) {
      console.log(err);
      res.status(500).send("An error occurred while creating the user");
    }
  });


  
/**
 * Returns a photo for a particular user.
 */
app.get("/user/:username/photo", (req, res) => { });

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port 3000: http://localhost:${PORT}`);
});
