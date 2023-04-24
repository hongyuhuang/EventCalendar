import React from "react";
import { CalendarEvent } from "./EventCalendar";
import { useLocation } from "react-router-dom";

function EventDetails() {
    const location = useLocation();
    const event: CalendarEvent = location.state.event;

  return (
    <div>
      <h2>{event.title}</h2>
      <p>{event.description}</p>
      <p>Start Time: {event.start.toLocaleString()}</p>
      <p>End Time: {event.end.toLocaleString()}</p>
    </div>
  );
}

export default EventDetails;