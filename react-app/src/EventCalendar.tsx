import React from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useNavigate } from "react-router-dom";

const localizer = momentLocalizer(moment);
export interface Event {
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: any;
  description?: string;
  location: string;
}

function EventCalendar(props: { events: Event[] }) {
  const events = props.events; // an array of event objects
  const navigate = useNavigate();

  const handleSelectEvent = (event: Event) => {
    navigate("/event-details", { state: { event } });
  };
  
  return (
    <div>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        onSelectEvent={handleSelectEvent}
        style={{ height: window.innerHeight - 150, width: "95vw" }}
      />
    </div>
  );
}

export default EventCalendar;
