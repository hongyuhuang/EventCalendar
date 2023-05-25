import React, { useEffect, useState, useRef } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Event, User } from "./types";

const localizer = momentLocalizer(moment);

function EventCalendar() {
    const [events, setEvents] = useState<Event[]>([]);
    const [showAssignedEvents, setShowAssignedEvents] = useState(false); // State for the toggle
    const recurringEventIdsRef = useRef<number[]>([]); // Ref for storing recurring event IDs

    const userData = sessionStorage.getItem("userData");
    const password = sessionStorage.getItem("password") || "";

    const authHeader = (username: string, password: string) => {
        const base64Credentials = btoa(`${username}:${password}`);
        return `Basic ${base64Credentials}`;
    };

    let username = "";
    let userId = 0;
    if (userData) {
        const user: User = JSON.parse(userData);
        username = user.email;
        userId = user.userId;
    }

    const headers = {
        Authorization: authHeader(username, password),
    };

    const navigate = useNavigate();

    // Handle event selection
    const handleSelectEvent = (event: Event) => {
        const isRecurring = recurringEventIdsRef.current.includes(
            event.eventId
        );
        navigate("/event-details", { state: { event, isRecurring } });
    };

    // Fetch all events
    const fetchEvents = async () => {
        try {
            // Retrieve recurring event suffixes
            const suffix_response = await axios.get(
                "/retrieve-recurring-suffixes",
                {
                    headers: headers,
                }
            );

            const recurringEventIds = suffix_response.data.map(
                (suffix: any) => suffix.eventId
            );
            recurringEventIdsRef.current = recurringEventIds;

            // Retrieve non-recurring events
            const response = await axios.get("http://localhost:3001/event", {
                headers: headers,
            });

            let recurring_events = [];

            // Retrieve recurring events if any exist
            if (recurringEventIds.length > 0) {
                const recurring_response = await axios.get(
                    "/event/retrieve-recurring-events",
                    {
                        params: {
                            recurringEventIds: recurringEventIds.join(","),
                        },
                        headers: headers,
                    }
                );

                recurring_events = recurring_response.data;
            }

            const parsedEvents = response.data.map((event: Event) => ({
                ...event,
                startDate: new Date(event.startDate),
                endDate: new Date(event.endDate),
            }));

            // Add recurring events to the list
            for (const repeatEvent of recurring_events) {
                const eventId = repeatEvent.eventId;
                const originalEvent = parsedEvents.find(
                    (event: Event) => event.eventId === eventId
                );

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

    // Fetch assigned events for the current user
    const getAssignedEvents = async (username: string) => {
        try {
            const response = await axios.get(`/user/${userId}/events`, {
                headers: headers,
            });
            const assignedEvents = response.data;
            setEvents(assignedEvents);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        // Fetch events based on the selected mode (assigned or all events)
        if (showAssignedEvents) {
            getAssignedEvents(username);
        } else {
            fetchEvents();
        }
    }, [showAssignedEvents]);

    return (
        <div>
            {/* Toggle for showing assigned events */}
            <label>
                Show Assigned Events:
                <input
                    type="checkbox"
                    checked={showAssignedEvents}
                    onChange={(e) => setShowAssignedEvents(e.target.checked)}
                />
            </label>

            {/* Calendar component */}
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
