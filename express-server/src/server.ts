const dotenv = require("dotenv");
const express = require("express");
const path = require("path");
const basicAuth = require("express-basic-auth");
const mysql = require('mysql2');

dotenv.config();
const app = express();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});


app.get('/test', (req, res) => {
  console.log(process.env.DB_HOST);
  console.log(process.env.DB_USER);
  console.log(process.env.DB_PASSWORD);
  console.log(process.env.DB_DATABASE);
  res.send('Environment variables loaded');
});

app.get('/', (req, res) => {
  res.redirect('/test');
});


// /**
//  * Authorizes a user using a username and password combination
//  *
//  * @param username string for the name of the user
//  * @param password string for a user's project
//  * @return boolean for if a user is authorized or not
//  */
// async function authorize(username: string, password: string): Promise<boolean> {
//   // TODO

//   /*

//     Query DB

//     TODO, username needs to be appropriately escaped

//     authorization should be based on what can be accessed, can be done on the route level.

//     Return result of the query

//      */

//   return true;
// }

/*
 * Route to return event with a given id
 */
app.get("/event/:id", (req, res) => {});

/**
 * Creates a new event
 */
app.post("/event", (req, res) => {});

/**
 * Performs a partial update on an event
 */
app.patch("/event/:eventId", (req, res) => {});

/**
 * Assigns a user to a particular event
 */
app.post("/event/:eventId/assign/:userId", (req, res) => {});

/*
 * Route to return all events for a given user
 *
 * Events can be filtered to come after a specific date-time
 */
app.get("/user/:username/events", (req, res) => {});

/**
 * Creates a new user
 */
app.post("/user", (req, res) => {})

/**
 * Returns a photo for a particular user.
 */
app.get("/user/:username/photo", (req, res) => {});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port 3000: http://localhost:${PORT}`);
});
