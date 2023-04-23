import React from 'react';
import styled from 'styled-components';
import { CalendarEvent } from './EventCalendar';

const EventContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #3174ad;
  color: #fff;
  font-size: 14px;
  padding: 5px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

function Event(props: { event: CalendarEvent; }) {
  const event = props.event;

  return (
    <EventContainer>
      {event.title} ({event.location})
    </EventContainer>
  );
}

export default Event;
