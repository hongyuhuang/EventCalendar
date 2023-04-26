import React from "react";
import { Event } from "./EventCalendar";
import { useLocation } from "react-router-dom";
import styled from "styled-components";

const Wrapper = styled.div`
    background-color: #ffffff;
    border-radius: 8px;
    -webkit-box-shadow: 0 4px 6px rgba(0, 0, 0, 0.7);
    -moz-box-shadow: 0 4px 6px rgba(0, 0, 0, 0.7);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    padding: 16px;
`;

const Title = styled.h2`
    font-size: 24px;
    margin-bottom: 8px;
`;

const Location = styled.p`
    font-size: 14px;
`;

const Description = styled.p`
    font-size: 14px;
    margin-bottom: 16px;
`;

const Time = styled.p`
    font-size: 14px;
`;

function EventDetails() {
    const location = useLocation();
    const event: Event = location.state.event;

    return (
        <Wrapper>
            <Title>{event.title}</Title>
            <Location>Location: {event.location}</Location>
            <Description>Description: {event.description}</Description>
            <Time>Start Time: {event.startDate.toLocaleString()}</Time>
            <Time>End Time: {event.endDate.toLocaleString()}</Time>
        </Wrapper>
    );
}

export default EventDetails;
