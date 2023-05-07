import { Pool, RowDataPacket } from "mysql2/promise";

import { ResultSetHeader } from "mysql2";
import { User } from "../entities";
import * as fs from "fs";
const path = require("path");

const { pool, handleDbError } = require("../helpers") as {
    pool: Pool;
    handleDbError: any;
};
const express = require("express");
const userRouter = express.Router();

// Password encryption
const bcrypt = require("bcrypt");

// For file uploads
const multer = require("multer");

// For only accepting jpg uploads
const fileFilter = function (req, file, cb) {
    if (file.mimetype !== "image/jpeg") {
        return cb(new Error("Only JPEG files are allowed"));
    }
    cb(null, true);
};

const upload = multer({
    dest: "photos/",
    fileFilter: fileFilter,
});

/**
 * Creates a new user
 */
userRouter.post("/", async (req, res) => {
    try {
        const passwordHashSalt = bcrypt.hashSync(req.body.password, 10);

        const { firstName, lastName, isAdmin, email} = req.body;
        const [result] = await pool.query<ResultSetHeader>(
            "INSERT INTO USER (firstName, lastName, isAdmin, email, password) VALUES (?, ?, ?, ?, ?)",
            [firstName, lastName, isAdmin, email, passwordHashSalt]
        );
        const { insertId } = result;
        res.send({ userId: insertId });
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(409).send("User with email already exists");
        }
        return handleDbError(
            err,
            res,
            "An internal error occurred while creating a user"
        );
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
        return handleDbError(
            err,
            res,
            "An internal error occurred while getting the users"
        );
    }
});

/**
 * Get a user by ID
 */
userRouter.get("/:userId", async (req, res) => {
    try {
        const [results] = await pool.query<User[]>(
            `SELECT *
             FROM USER
             WHERE userId = ?`,
            [req.params.userId]
        );
        if (
            typeof results === "undefined" ||
            (results as RowDataPacket[]).length === 0
        ) {
            return res.status(404).send("User not found");
        } else {
            res.send(results[0]);
        }

        const foundUser = results[0];

        if (req.role !== "admin") {
            foundUser.password = "REDACTED";
        }
        return res.send(foundUser);
    } catch (err) {
        return handleDbError(
            res,
            err,
            "An internal error occurred while getting a user"
        );
    }
});

/**
 * Delete a user by ID
 */
userRouter.delete("/:userId", async (req, res) => {
    try {
        const [results] = await pool.query<ResultSetHeader>(
            `DELETE FROM USER
             WHERE userId = ?`,
            [req.params.userId]
        );
        if (results.affectedRows === 0) {
            res.status(404).send("User not found");
        } else {
            res.sendStatus(204);
        }
    } catch (err) {
        return handleDbError(
            res,
            err,
            "An internal error occurred while deleting a user"
        );
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
        return handleDbError(
            res,
            err,
            "An internal error occurred while getting events for a user"
        );
    }
});

/**
 * Changes a password. Only the user as themselves or an admin can change a password.
 */
userRouter.patch("/:userId/password", async (req, res) => {
    try {
        // Check headers to see for match
        if (
            req.auth.username !== req.params.userId ||
            !(req.role === "admin")
        ) {
            res.status(403).send("Forbidden");
            return;
        }

        const passwordHashSalt = bcrypt.hashSync(req.body.newPassword, 10);

        const whereClause = `WHERE userId = ?`;
        const queryParams: string[] = [passwordHashSalt, req.params.id];

        if (req.role !== "admin") {
            // Need to check value of email too, if user is not an admin
            queryParams.push(req.auth.username);
            whereClause.concat(`AND email = ?`);
        }

        const results = (
            await pool.query<ResultSetHeader>(
                `UPDATE USER
                 SET password = ?
                 ${whereClause}`,
                queryParams
            )
        )[0];

        if (results.affectedRows === 0) {
            res.status(404).send("User not found");
        } else {
            res.sendStatus(204);
        }
    } catch (err) {
        return handleDbError(
            res,
            err,
            "An internal error occurred while updating a user's password"
        );
    }
});

/**
 * Returns a photo for a particular user.
 */
userRouter.get("/:userId/photo", async (req, res) => {
    if (
        req.role !== "admin" &&
        !(await checkUserIdMatchesUsername(
            req.params.userId,
            req.auth.username
        ))
    ) {
        return res.status(403).send("Forbidden");
    }
    const photoDir = userPhotoDir(req.params.userId);

    // Check if file exists
    if (!fs.existsSync(photoDir)) {
        return res.status(404).send("Photo not found");
    }
    return res.sendFile(`${process.cwd()}${path.sep}${photoDir}`); // Requires absolute path
});

/**
 * Uploads a photo for a particular user, covers cases of updating and creating
 */
userRouter.post("/:userId/photo", upload.single("photo"), async (req, res) => {
    if (
        req.role !== "admin" &&
        !(await checkUserIdMatchesUsername(
            req.params.userId,
            req.auth.username
        ))
    ) {
        return res.status(403).send("Forbidden");
    }

    fs.renameSync(req.file.path, userPhotoDir(req.params.userId));

    res.send("File uploaded successfully");
});

/**
 * Checks if a user ID matches a username
 *
 * @param userId string
 * @param username string
 * @return Promise resolving to boolean
 */
async function checkUserIdMatchesUsername(
    userId: string,
    username: string
): Promise<boolean> {
    const [results] = await pool.query<[]>(
        `SELECT * FROM USER WHERE userId = ? AND email = ?`,
        [userId, username]
    );
    return results.length > 0;
}

/**
 * Returns the directory for a saved user's photo, relative to the current file.
 *
 * @param userId string
 * @return string
 */
function userPhotoDir(userId: string) {
    return `photos\\user_${userId}.jpg`;
}

export {};

module.exports = {
    userRouter,
    checkUserIdMatchesUsername,
};
