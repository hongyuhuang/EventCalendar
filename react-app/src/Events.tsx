import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

function EventCalendar(props: { events: any; }) {
  const events = props.events; // an array of event objects

  return (
    <div>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: window.innerHeight, width: '95vw'}}
      />
    </div>
  );
}

export default EventCalendar;
