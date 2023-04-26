import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const localizer = momentLocalizer(moment);
export interface Event {
    title: string;
    location: string;
    startDate: Date;
    endDate: Date;
    description: string;
}

function EventCalendar() {
    const [events, setEvents] = useState<Event[]>([]);

    const authHeader = (username: string, password: string) => {
        const base64Credentials = btoa(`${username}:${password}`);
        return `Basic ${base64Credentials}`;
    };

    const username = "johndoe@email.com";
    const password = "password123";

    const headers = {
        Authorization: authHeader(username, password),
    };

    useEffect(() => {
        axios
            .get("http://localhost:3001/event", { headers: headers })
            .then((response) => {
                const parsedEvents = response.data.map((event: Event) => {
                    return {
                        ...event,
                        startDate: new Date(event.startDate),
                        endDate: new Date(event.endDate),
                    };
                });
                setEvents(parsedEvents);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    const navigate = useNavigate();

    const handleSelectEvent = (event: Event) => {
        navigate("/event-details", { state: { event } });
    };

    return (
        <div>
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
