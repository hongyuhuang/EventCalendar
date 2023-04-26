import React from "react";
import { Event } from "./EventCalendar";
import { useLocation } from "react-router-dom";

function EventDetails() {
    const location = useLocation();
    const event: Event = location.state.event;  

  return (
    <div>
      <h2>{event.title}</h2>
      <p>{event.description}</p>
      <p>Start Time: {event.startDate.toLocaleString()}</p>
      <p>End Time: {event.endDate.toLocaleString()}</p>
    </div>
  );
}

export default EventDetails;