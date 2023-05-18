import React, { useEffect, useState } from "react";
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

    const userData = sessionStorage.getItem("userData");
    const password = sessionStorage.getItem("password") || "";

    const authHeader = (username: string, password: string) => {
        const base64Credentials = btoa(`${username}:${password}`);
        return `Basic ${base64Credentials}`;
    };

    let username = "";
    let userId = 0;
    if(userData) {
        const user: User = JSON.parse(userData);
        username = user.email;
        userId = user.userId;
    }

    const headers = {
        Authorization: authHeader(username, password),
    };

    const navigate = useNavigate();

    const handleSelectEvent = (event: Event) => {
        navigate("/event-details", { state: { event } });
    };

    const fetchEvents = async () => {
        try {
            const response = await axios.get("/event", {
                headers: headers,
            });
            const parsedEvents = response.data.map((event: Event) => ({
                ...event,
                startDate: new Date(event.startDate),
                endDate: new Date(event.endDate),
            }));
            setEvents(parsedEvents);
        } catch (error) {
            console.log(error);
        }
    };

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
