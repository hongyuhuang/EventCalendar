import { Pool, RowDataPacket } from "mysql2/promise";
import { sendEmail } from "./emails";
import { Event, User } from "../entities";
import { format } from "date-fns";
import { OkPacket, ResultSetHeader } from "mysql2";
const express = require("express");
const eventRouter = express.Router();
const eventCleaner = require("./event-cleaner");

const { pool, handleApiError, checkUserPermissions } =
    require("../helpers") as {
        pool: Pool;
        handleApiError: any;
        checkUserPermissions: any;
    };

const createHttpError = require("http-errors");
eventCleaner.startCronJob();

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
 * Deletes events whose endDate has passed the current time
 */
eventRouter.delete("/", async (req, res) => {
    try {
        // Fetch all events from the database
        console.log("!");
        const [rows] = await pool.query("SELECT eventId, endDate FROM EVENT");

        const events = rows as { eventId: number; endDate: string }[];

        const currentTime = new Date();

        const eventsToDelete = [];

        // Check each event's endDate and collect the IDs of events to be deleted
        events.forEach((event) => {
            const { eventId, endDate } = event;
            const formattedEndDate = new Date(endDate);

            if (formattedEndDate <= currentTime) {
                eventsToDelete.push(eventId);
            }
        });

        // Delete the events from the database
        if (eventsToDelete.length > 0) {
            await pool.query("DELETE FROM EVENT WHERE eventId IN (?)", [
                eventsToDelete,
            ]);
        }

        const deleteCount = eventsToDelete.length;
        console.log("Deleting: " + deleteCount);
        return res.send(`${deleteCount} event(s) deleted`);
    } catch (err) {
        return handleApiError(
            err,
            res,
            "An error occurred while deleting the events"
        );
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

        const validEvent: boolean = await checkEventIsValid(
            location,
            formattedStartDate,
            formattedEndDate
        );

        if (!validEvent) {
            return res
                .status(400)
                .send("Event overlaps with an existing event.");
        }

        const [result] = await pool.query<ResultSetHeader>(
            "INSERT INTO EVENT (title, location, startDate, endDate, description) VALUES (?, ?, ?, ?, ?)",
            [title, location, formattedStartDate, formattedEndDate, description]
        );

        // sendEmail("A new event has been added!",
        //     "cody_airey@icloud.com",
        //     ("Hi Cody, a new event has been made for you.\n\nLocation: " + location +".\nStart date is: " + startDate + "\nEnd date is: " + endDate + "\n\nDescription:\n" + description))

        const { insertId } = result;
        return res.status(201).send({ eventId: insertId });
    } catch (err) {
        return handleApiError(
            err,
            res,
            "An error occurred while creating the event"
        );
    }
});

/*
 * Route to return event with a given id
 */
eventRouter.get("/:eventId", async (req, res) => {
    const eventId = req.params.eventId;

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
 * Deletes an event by ID
 */
eventRouter.delete("/:eventId", async (req, res) => {
    try {
        const { eventId } = req.params;
        await pool.query("DELETE FROM EVENT WHERE eventId = ?", [eventId]);
        res.send(`Event with ID ${eventId} deleted`);
    } catch (err) {
        return handleApiError(
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
        const formattedStartDate = format(
            new Date(startDate),
            "yyyy-MM-dd HH:mm:ss"
        );
        const formattedEndDate = format(
            new Date(endDate),
            "yyyy-MM-dd HH:mm:ss"
        );

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

        // sendEmail("One of your events has been edited!",
        //     "cody_airey@icloud.com",
        //     ("Hi Cody, an event with your involvement has been changed.\n\n Location: " + location +".\nStart date is: " + startDate + "\nEnd date is: " + endDate + "\n\nDescription:\n" + description))

        return res.send("Event updated successfully");
    } catch (err) {
        return handleApiError(
            err,
            res,
            "An error occurred while updating the event"
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
        return handleApiError(
            err,
            res,
            "An error occurred while getting the users assigned to the event"
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

        // had to comment this out for route to work, not sure why but its getting passed the userId thats
        // trying to be assigend to an event, and then checking if its admin, which doesn't matter for asignee's

        await checkUserPermissions(req.role, userId, res.auth.user);

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
        return handleApiError(
            err,
            res,
            "An error occurred while assigning the user to the event"
        );
    }
});

/**
 * Removes an assignment for a user to an event
 */
eventRouter.delete("/:eventId/assign/:userId", async (req, res) => {
    try {
        const { eventId, userId } = req.params;
        await checkUserPermissions(req.role, userId, res.auth.user);

        await checkEventAndUserExists(eventId, userId, res);
        await attendanceRecordExists(eventId, userId);

        const [results] = await pool.query(
            "DELETE FROM ATTENDANCE_RECORD WHERE eventId = ? AND userId = ?",
            [eventId, userId]
        );
        return res.send("User un-assigned from event successfully");
    } catch (err) {
        return handleApiError(
            err,
            res,
            "An error occurred while un-assigning the user from the event"
        );
    }
});

/**
 * Checks if an attendance record exists
 *
 * @param eventId string for an event
 * @param userId string for a user
 */
async function attendanceRecordExists(eventId: string, userId: string) {
    // Check if the attendance record exists
    const [attendanceResults] = await pool.query(
        "SELECT * FROM ATTENDANCE_RECORD WHERE eventId = ? AND userId = ?",
        [eventId, userId]
    );

    if ((attendanceResults as RowDataPacket[])[0].length === 0) {
        throw new createHttpError(404, "Attendance record not found");
    }
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

async function checkEventIsValid(eventLoc, eventStart, eventEnd) {
    try {
        // Ensures event does not have overlapping time for existing event of same location.
        const eventResults = await pool.query<Event[]>(
            `SELECT *
                FROM EVENT
                WHERE location = ?
                AND (
                    (startDate BETWEEN ? AND ?)
                    OR (endDate BETWEEN ? AND ?)
                    OR (startDate < ? AND endDate > ?)
                )`,
            [
                eventLoc,
                eventStart,
                eventEnd,
                eventStart,
                eventEnd,
                eventStart,
                eventEnd,
            ]
        );
        if ((eventResults as RowDataPacket[])[0].length === 0) {
            return true;
        } else {
            console.log("Attempted event overlaps with an existing one.");
            // console.log((eventResults as RowDataPacket[])[0])
            return false;
        }
    } catch (error) {
        console.log(error);
        throw new createHttpError(500, "Server error");
    }
}

export {};

module.exports = {
    eventRouter,
};
