export {};

import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Load env variables
dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});

/**
 * Handles an error when querying a DB, sends an appropriate express response
 *
 * @param err error thrown, may be a createHttpError or a mysql error
 * @param res express Response to send back to client
 * @param msg message to accompany the response
 */
function handleDbError(err: any, res, msg: string) {
    console.log(err);
    return res
        .status(err.status ? err.status : 500)
        .send(err.message ? err.message : msg);
}

module.exports = {
    pool,
    handleDbError,
};
