const cron = require('node-cron');
import { Pool, RowDataPacket } from "mysql2/promise";
const { pool, handleDbError } = require("../helpers") as {
    pool: Pool;
    handleDbError: any;
};

async function deleteFinishedEvents() {
    try {
        // Fetch all events from the database
        const [rows] = await pool.query("SELECT eventId, endDate FROM EVENT");
        
        const events = rows as { eventId: number, endDate: string }[];

        const currentTime = new Date();

        const eventsToDelete = [];

        // Check each event's endDate and collect the IDs of events to be deleted
        events.forEach(event => {
            const { eventId, endDate } = event;
            const formattedEndDate = new Date(endDate);

            if (formattedEndDate <= currentTime) {
                eventsToDelete.push(eventId);
            }
        });

        // Delete the events from the database
        if (eventsToDelete.length > 0) {
            await pool.query("DELETE FROM EVENT WHERE eventId IN (?)", [eventsToDelete]);
        }

        const deleteCount = eventsToDelete.length;
        // console.log("Deleting: " + deleteCount);
        return deleteCount;
    } catch (err) {
        throw new Error("An error occurred while deleting the events: " + err);
    }
}

function startCronJob() {
    //every min: '* * * * *'  <- use for demo
    //every hour '0 * * * *'
    const task = cron.schedule('0 * * * *', async () => {
        console.log("attempting...")
        try {
            const deletedCount = await deleteFinishedEvents();
            console.log(`${deletedCount} event(s) deleted`);
        } catch (error) {
            console.error('Error deleting events:', error);
        }
    });

    task.start();
}

module.exports = {
    startCronJob
};