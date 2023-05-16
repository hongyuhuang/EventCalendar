import { Pool, RowDataPacket } from "mysql2/promise";
import { ResultSetHeader } from "mysql2";
const { pool, handleDbError } = require("../helpers") as {
    pool: Pool;
    handleDbError: any;
};

async function createRecurringEventSuffix(eventId, startDate, endDate, selectedInterval, endRecurringStartDate){

    try {

        let startDates: Date[] = [];
        let endDates: Date[] = [];
        var currentStartDate = new Date(startDate);
        var currentEndDate = new Date(endDate);
        var endRecurringDate = new Date(endRecurringStartDate);

        console.log(typeof(currentStartDate) + " " + currentStartDate)
        console.log(typeof(currentEndDate) + " " + currentEndDate)
        console.log(typeof(endRecurringDate) + " " + endRecurringDate)

        // could use a switch/case, but this works fine.
        while (currentStartDate < endRecurringDate) {

            console.log(currentStartDate + " -> " + currentEndDate)

            if (selectedInterval === "daily") {
              currentStartDate.setDate(currentStartDate.getDate() + 1);
              currentEndDate.setDate(currentEndDate.getDate() + 1);
            } else if (selectedInterval === "weekly") {
              currentStartDate.setDate(currentStartDate.getDate() + 7);
              currentEndDate.setDate(currentEndDate.getDate() + 7);
            } else if (selectedInterval === "fortnightly") {
              currentStartDate.setDate(currentStartDate.getDate() + 14);
              currentEndDate.setDate(currentEndDate.getDate() + 14);
            } else if (selectedInterval === "monthly") {
              currentStartDate.setMonth(currentStartDate.getMonth() + 1);
              currentEndDate.setMonth(currentEndDate.getMonth() + 1);
              if (currentStartDate.getMonth() !== (currentStartDate.getMonth() + 1) % 12) {
                currentStartDate.setFullYear(currentStartDate.getFullYear() + 1);
                currentEndDate.setFullYear(currentEndDate.getFullYear() + 1);
              }
            } else if (selectedInterval === "yearly") {
              currentStartDate.setFullYear(currentStartDate.getFullYear() + 1);
              currentEndDate.setFullYear(currentEndDate.getFullYear() + 1);
            }
          
            const newStartDate = new Date(currentStartDate.getTime());
            startDates.push(newStartDate);
          
            const newEndDate = new Date(currentEndDate.getTime());
            endDates.push(newEndDate);
          }

        console.log(startDates)
        console.log(endDates)

        const [suffixResult] = await pool.query<ResultSetHeader>(`INSERT INTO RECURRING_EVENT_SUFFIX(eventId, type, endRecurringDate)
        VALUES (?, ?, ?);`, [eventId, selectedInterval, endRecurringStartDate]);

        console.log(suffixResult)

        const { insertId } = suffixResult;
        const suffixId = insertId;

        for(let i = 0; i < startDates.length; i++){

            console.log(i)

            let insertStartDateValue = startDates[i];
            let insertEndDateValue = endDates[i];

            console.log(insertStartDateValue)
            console.log(insertEndDateValue)

            const [recurringEventResult] = await pool.query<ResultSetHeader>(`INSERT INTO RECURRING_EVENT(recurringEventSuffixId, startDate, endDate)
            VALUES (?, ?, ?);`, [suffixId, insertStartDateValue, insertEndDateValue]);
            console.log(recurringEventResult);
        }
        
    } catch (error) {
        throw new Error("idk man: " + error);
    }
}


module.exports = {
    createRecurringEventSuffix
}