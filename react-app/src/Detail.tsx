import React from "react";
import { EventType } from "./types";
import moment from "moment";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import styled from "styled-components";

/**
 * Converts a date to a string to be presented to user
 *
 * @param date Date object
 * @return String as described
 */
function convertDate(date: Date) {
  return moment(date).format(" hh:mm DD/MM/YY");
}

/**
 * Type for DetailProps
 */
type DetailProps = {
  event: EventType | null;
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 10px;
  background-color: var(--otago-grey-dark);
  flex-wrap: wrap;
`;

const Fact = styled.div`
  display: flex;
  flex-direction: row;
`;

const EventDescription = styled.div`
  display: flex;
  flex-direction: column;
`;

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
    endDate: new Date(),
  };

  return (
    <Wrapper>
      <div>
        <h1>{event.title}</h1>

        <Fact className="event-detail-fact">
          Starts: {convertDate(event.startDate)}
        </Fact>
        <Fact className="event-detail-fact">
          Ends: {convertDate(event.endDate)}
        </Fact>
        <Fact className="event-detail-fact">
          Assignees: // TODO: Add assignees
        </Fact>
        <EventDescription id="event-description">
          <h2>Description</h2>
          <p>{event.description}</p>
        </EventDescription>
      </div>

      <div id="calendar-div">
        <Calendar value={event.startDate} />
      </div>
    </Wrapper>
  );
};

export default Detail;
