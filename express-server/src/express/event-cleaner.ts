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

        // console.log("events to delete: " + eventsToDelete)

        const [dontDeleteResult] = await pool.query("SELECT eventId FROM RECURRING_EVENT_SUFFIX");
        const dontDeleteIds = (dontDeleteResult as { eventId: number }[]).map(row => row.eventId);

        // Remove events that have a matching ID in dontDeleteResult
        const filteredEventsToDelete = eventsToDelete.filter(eventId => !dontDeleteIds.includes(eventId));

        // console.log("filteredEventsToDelete" + filteredEventsToDelete)

        // Delete the remaining events from the database
        if (filteredEventsToDelete.length > 0) {
            await pool.query("DELETE FROM EVENT WHERE eventId IN (?)", [filteredEventsToDelete]);
        }


        const [recurringEvents] = await pool.query("SELECT recurringEventId, endDate FROM RECURRING_EVENT")

        // console.log(recurringEvents)

        const recurringEventsToDelete = (recurringEvents as { recurringEventId: number, endDate: string }[])
            .filter(recurringEvent => {
                const { recurringEventId, endDate } = recurringEvent;
                const formattedEndDate = new Date(endDate);
                return formattedEndDate <= currentTime;
            })
            .map(recurringEvent => recurringEvent.recurringEventId);

        // console.log(recurringEventsToDelete)

        // Delete the recurring events from the database
        if (recurringEventsToDelete.length > 0) {
            await pool.query("DELETE FROM RECURRING_EVENT WHERE recurringEventId IN (?)", [recurringEventsToDelete]);
        }

        const deleteCount = filteredEventsToDelete.length + recurringEventsToDelete.length;
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