import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Event } from "./types";

const localizer = momentLocalizer(moment);

function EventCalendar({
    username,
    password,
}: {
    username: string;
    password: string;
}) {
    const [events, setEvents] = useState<Event[]>([]);
    const [showAssignedEvents, setShowAssignedEvents] = useState(false); // State for the toggle

    const authHeader = (username: string, password: string) => {
        const base64Credentials = btoa(`${username}:${password}`);
        return `Basic ${base64Credentials}`;
    };

    const headers = {
        Authorization: authHeader(username, password),
    };

    const navigate = useNavigate();

    const handleSelectEvent = (event: Event) => {
        navigate("/event-details", { state: { event } });
    };

    const fetchEvents = async () => {
        try {
            const response = await axios.get("http://localhost:3001/event", {
                headers: headers,
            });

            const suffix_response = await axios.get("http://localhost:3001/event/retrieve-recurring-suffixes", {
                headers: headers,
            });

            const eventIds = suffix_response.data.map((suffix: any) => suffix.eventId);

            //I have no idea how to get this workign with get, when i use it, i cant pass the array for the LIFE of me.
            const recurring_response = await axios.post("http://localhost:3001/event/retrieve-recurring-events", 
                eventIds,
                {headers: headers}
              );

            const recurring_events = recurring_response.data;
            
            const parsedEvents = response.data.map((event: Event) => ({
                ...event,
                startDate: new Date(event.startDate),
                endDate: new Date(event.endDate),
            }));

            // so gross
            for (const repeatEvent of recurring_events) {
                const eventId = repeatEvent.eventId;
                const originalEvent = parsedEvents.find((event: Event) => event.eventId === eventId);
                
                if (originalEvent) {
                  const repeatStartDate = repeatEvent.startDate;
                  const repeatEndDate = repeatEvent.endDate;

                  const repeatEventCopy = { ...originalEvent }; // Create a shallow copy of the original event
                  repeatEventCopy.startDate = new Date(repeatStartDate);
                  repeatEventCopy.endDate = new Date(repeatEndDate);
              
                  parsedEvents.push(repeatEventCopy);
                }
              }
 
            setEvents(parsedEvents);
        } catch (error) {
            console.log(error);
        }
    };

    const getAssignedEvents = async (username: string) => {
        try {
            const userID = 3; // TODO: Get the user ID from local storage
            const response = await axios.get(
                `http://localhost:3001/user/${userID}/events`,
                { headers: headers }
            );
            const assignedEvents = response.data;
            setEvents(assignedEvents);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (showAssignedEvents) {
            getAssignedEvents(username);
        } else {
            fetchEvents();
        }
    }, [showAssignedEvents]);

    return (
        <div>
            <label>
                Show Assigned Events:
                <input
                    type="checkbox"
                    checked={showAssignedEvents}
                    onChange={(e) => setShowAssignedEvents(e.target.checked)}
                />
            </label>

            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="startDate"
                endAccessor="endDate"
                onSelectEvent={handleSelectEvent}
                style={{ height: window.innerHeight - 150, width: "95vw" }}
            />
        </div>
    );
}

export default EventCalendar;
