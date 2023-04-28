import { Pool, RowDataPacket } from "mysql2/promise";

import { Event, User } from "../entities";
import { format } from "date-fns";
import { OkPacket, ResultSetHeader } from "mysql2";
const express = require("express");
const eventRouter = express.Router();
const { pool, handleDbError } = require("../helpers") as {
    pool: Pool;
    handleDbError: any;
};

const createHttpError = require("http-errors");

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
        return res.status(201).send({ eventId: insertId });
    } catch (err) {
        return handleDbError(
            err,
            res,
            "An error occurred while creating the event"
        );
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
        return handleDbError(
            err,
            res,
            "An error occurred while deleting the event"
        );
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
        return res.send("Event updated successfully");
    } catch (err) {
        return handleDbError(
            err,
            res,
            "An error occurred while updating the event"
        );
    }
});

/**
 * Assigns a user to a particular event
 */
eventRouter.post("/:eventId/assign/:userId", async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const userId = req.params.userId;

        await checkEventAndUserExists(eventId, userId, res);
        await checkUserCanChangeAssignment(userId, eventId, res);

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
        return res.status(201).send("User assigned to event successfully");
    } catch (err) {
        return handleDbError(
            err,
            res,
            "An error occurred while assigning the user to the event"
        );
    }
});

/**
 * Finds all the users that are assigned to an event
 */
eventRouter.get("/:eventId/assign", async (req, res) => {
    try {
        // Checks if the event exists
        const eventResults = await pool.query<Event[]>(
            `SELECT * FROM EVENT WHERE eventId = ?`
        );
        if ((eventResults as RowDataPacket[])[0].length === 0) {
            return res.status(404).send("Event not found");
        }
        const userResults = pool.query<User[]>(
            `SELECT U.userId, firstName, lastName
                FROM ATTENDANCE_RECORD ar JOIN USER U on U.userId = ar.userId
                WHERE eventId = ?`,
            [req.params.eventId]
        );
        return res.send(userResults);
    } catch (err) {
        return handleDbError(
            err,
            res,
            "An error occurred while getting the users assigned to the event"
        );
    }
});

/**
 * Removes an assignment for a user to an event
 */
eventRouter.delete("/:eventId/assign/:userId", async (req, res) => {
    try {
        const { eventId, userId } = req.params;

        await checkEventAndUserExists(eventId, userId, res);
        await checkUserCanChangeAssignment(userId, eventId, res);

        const [results] = await pool.query(
            "DELETE FROM ATTENDANCE_RECORD WHERE eventId = ? AND userId = ?",
            [eventId, userId]
        );
        // @ts-ignore
        if (results.affectedRows === 0) {
            return res.status(404).send("User not assigned to event");
        }
        return res.send("User un-assigned from event successfully");
    } catch (err) {
        return handleDbError(
            err,
            res,
            "An error occurred while un-assigning the user from the event"
        );
    }
});

/**
 * Checks if a user can change an assignment or not
 *
 * If not, a response is automatically sent back to client
 *
 * @param req express Request
 * @param res express Response
 * @param userId id of the user to check permissions
 */
async function checkUserCanChangeAssignment(req, res, userId) {
    // If the user is not an admin, check if the auth username matches the user being assigned
    if (req.role !== "admin") {
        const results = await pool.query<User[]>(
            `SELECT * 
                         FROM USER
                         WHERE email = ? AND userId = ?`,
            [req.auth.username, userId]
        );
        if ((results as RowDataPacket[])[0].length === 0) {
            throw new createHttpError(403, "User cannot change assignment");
        }
    }
    return;
}

/**
 * Checks if a user and event exist before assigning a user to an event
 *
 * A response is automatically sent if not
 *
 * @param eventId string for an event id
 * @param userId string for a user id
 */
async function checkEventAndUserExists(eventId: string, userId: string, res) {
    // Check if the event exists
    const [eventResults] = await pool.query<Event[]>(
        `SELECT *
             FROM EVENT
             WHERE eventId = ?`,
        [eventId]
    );

    if ((eventResults as RowDataPacket[]).length === 0) {
        throw new createHttpError(404, "Event not found");
    }

    // Check if the user exists
    const userResults = await pool.query<User[]>(
        `SELECT *
                     FROM USER
                     WHERE userId = ?`,
        [userId]
    );

    if ((userResults as RowDataPacket[]).length === 0) {
        throw new createHttpError(404, "User not found");
    }
    return;
}

export {};

module.exports = {
    eventRouter,
};
