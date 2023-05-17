import { Pool, RowDataPacket } from "mysql2/promise";

import { ResultSetHeader } from "mysql2";
import { User } from "../entities";
import * as fs from "fs";
const path = require("path");

const { pool, handleApiError, checkUserPermissions } =
    require("../helpers") as {
        pool: Pool;
        handleApiError: any;
        checkUserPermissions: any;
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
        const { firstName, lastName, isAdmin, email, password } = req.body;

        const passwordHashSalt = bcrypt.hashSync(password, 10);

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
        return handleApiError(
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
        return handleApiError(
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
        return handleApiError(
            res,
            err,
            "An internal error occurred while getting a user"
        );
    }
});

/**
 * Updates a user. Intended to be used by front end for updating a user's profile
 */
userRouter.patch("/:userId", async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        console.log(`${req.role} ${req.params.userId} ${req.auth.user}`);

        await checkUserPermissions(req.role, req.params.userId, req.auth.user);

        const passwordHashSalt = bcrypt.hashSync(password, 10);

        const result = await pool.query<ResultSetHeader>(
            "UPDATE USER SET firstName = ?, lastName = ?, email = ?, password = ? WHERE userId = ?",
            [firstName, lastName, email, passwordHashSalt, req.params.userId]
        );

        if (result[0].affectedRows === 0) {
            return res.status(404).send("User not found");
        }

        return res.status(204).send("User updated successfully");
    } catch (err) {
        return handleApiError(
            err,
            res,
            "An error occurred while updating the user"
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
        return handleApiError(
            res,
            err,
            "An error occurred while deleting a user"
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

        // Check if the user is assigned to 0 events
        if (results.length === 0) {
            res.send([]); // Return an empty array
        } else {
            res.send(results);
        }
    } catch (err) {
        return handleApiError(
            res,
            err,
            "An error occurred while getting events for a user"
        );
    }
});

/**
 * Changes a password. Only the user as themselves or an admin can change a password.
 */
userRouter.patch("/:userId/password", async (req, res) => {
    try {
        await checkUserPermissions(req.role, req.params.userId, res.auth.user);

        const passwordHashSalt = bcrypt.hashSync(req.body.newPassword, 10);

        const whereClause = `WHERE userId = ?`;
        const queryParams: string[] = [passwordHashSalt, req.params.id];

        if (req.role !== "admin") {
            // Need to check value of email too, if user is not an admin
            queryParams.push(req.auth.user);
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
        return handleApiError(
            res,
            err,
            "An error occurred while updating a user's password"
        );
    }
});

/**
 * Returns a photo for a particular user.
 */
userRouter.get("/:userId/photo", async (req, res) => {
    await checkUserPermissions(req.role, req.params.userId, res.auth.user);
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
    await checkUserPermissions(req.role, req.params.userId, res.auth.user);

    fs.renameSync(req.file.path, userPhotoDir(req.params.userId));

    res.send("File uploaded successfully");
});

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
};
