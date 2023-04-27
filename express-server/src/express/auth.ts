import basicAuth from "express-basic-auth";
import assert from "assert";
import acl from "express-acl";
import { Pool } from "mysql2/promise";
import { User } from "../entities";

const pool: Pool = require("../sql-setup").pool;
const authRouter = require("express").Router();

authRouter.use(
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

// Adding in Role based auth
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

authRouter.use(acl.authorize);

// Adding in login route

/**
 * Handles login of the React authRouter.
 *
 * Basically just returns whether a user is an admin or not that a user has, given the headers. It is already assumed that their credentials are valid.
 */
authRouter.get("/login", (req, res) => {
    res.status(200).json({
        // @ts-ignore
        isAdmin: req.role === "admin",
    });
});

module.exports = {
    authRouter,
};
