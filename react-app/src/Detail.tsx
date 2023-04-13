import React from 'react'
import {EventType} from "./types";
import moment from "moment";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

/**
 * Converts a date to a string to be presented to user
 *
 * @param date Date object
 * @return String as described
 */
function convertDate(date: Date) {
    return moment(date).format(" hh:mm DD/MM/YY")
}

/**
 * Type for DetailProps
 */
type DetailProps = {
    event: EventType | null
}

/**
 * Element to detail a specific event
 *
 * @constructor
 * @param props Props for the element
 */
const Detail = (props: DetailProps) => {

    // Just for some dummy data, should remove later
    let event = props.event ?? {
        location: "Nowhere",
        title: "Test",
        description: "My test event",
        startDate: new Date(),
        endDate: new Date()
    }

    return (
        <div id="detail-div">
            <div>
                <h1>{event.title}</h1>

                <div className = "event-detail-fact">
                    Starts: {convertDate(event.startDate)}
                </div>
                <div className = "event-detail-fact">
                    Ends: {convertDate(event.endDate)}
                </div>
                <div className = "event-detail-fact">
                    Assignees: // TODO: Add assignees
                </div>
                <div id="event-description">
                    <h2>Description</h2>
                    <p>{event.description}</p>
                </div>
            </div>

            <div id = "calendar-div">
                <Calendar value = {event.startDate}/>
            </div>
        </div>
    );
}

export default Detail