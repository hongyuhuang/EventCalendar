import { Pool, RowDataPacket } from "mysql2/promise";

import { ResultSetHeader } from "mysql2";
import { User } from "../entities";

const pool: Pool = require("../sql-setup").pool;
const express = require("express");
const userRouter = express.Router();

/**
 * Creates a new user
 */
userRouter.post("/", async (req, res) => {
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
 * Get all users
 */
userRouter.get("/", async (req, res) => {
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
 * Get a user by ID
 */
userRouter.get("/:id", async (req, res) => {
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
 * Delete a user by ID
 */
userRouter.delete("/:id", async (req, res) => {
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

/*
 * Route to return all events for a given user
 *
 * Events can be filtered to come after a specific date-time
 */
userRouter.get("/:userId/events", async (req, res) => {
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
 * Returns a photo for a particular user.
 */
userRouter.get("/:username/photo", (req, res) => {});

/**
 * Changes a password. Only the user as themselves or an admin can change a password.
 */
userRouter.patch("/:id/password", async (req, res) => {
    try {
        if (req.params.id !== req.auth.userid && !req.role.isadmin) {
            res.status(403).send("Forbidden");
        }
        const [results] = await pool.query<ResultSetHeader>(
            `UPDATE USER
             SET password = ?
             WHERE userId = ?`,
            [req.body.password, req.params.id]
        );
        if (results.affectedRows === 0) {
            res.status(404).send("User not found");
        } else {
            res.sendStatus(204);
        }
    } catch (err) {
        console.log(err);
        res.status(500).send("An error occurred while updating the user");
    }
});

export {};

module.exports = {
    userRouter,
};
