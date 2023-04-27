import { Pool, RowDataPacket } from "mysql2/promise";

import { Event, User } from "../entities";
import { format } from "date-fns";
import { OkPacket, ResultSetHeader } from "mysql2";
const express = require("express");
const eventRouter = express.Router();
const pool: Pool = require("../sql-setup").pool;

/*
 * Route to return event with a given id
 */
eventRouter.get("/:id", async (req, res) => {
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
eventRouter.get("/", async (req, res) => {
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
eventRouter.post("/", async (req, res) => {
    try {
        const { title, location, startDate, endDate, description } = req.body;
        const formattedStartDate = format(
            new Date(startDate),
            "yyyy-MM-dd HH:mm:ss"
        );
        const formattedEndDate = format(
            new Date(endDate),
            "yyyy-MM-dd HH:mm:ss"
        );

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
eventRouter.delete("/:eventId", async (req, res) => {
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
eventRouter.patch("/:eventId", async (req, res) => {
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
 * Assigns a user to a particular vent
 */
eventRouter.post("/:eventId/assign/:userId", async (req, res) => {
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

        if ((eventResults as RowDataPacket[])[0].length === 0) {
            //might need a [0] before length.
            return res.status(404).send("Event not found");
        }

        // Check if the user exists
        const userResults = await pool.query<User[]>(
            `SELECT *
                     FROM USER
                     WHERE userId = ?`,
            [userId]
        );

        if ((userResults as RowDataPacket[])[0].length === 0) {
            //might need a [0] before length.
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

export {};

module.exports = {
    eventRouter,
};
