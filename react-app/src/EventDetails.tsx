import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Event } from "./types";


const Wrapper = styled.div`
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    padding: 16px;
    width: 960px;
`;

const Heading = styled.h2`
    color: var(--otago-blue-dark);
`;

const Label = styled.label`
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
    width: 100%;
`;

const Text = styled.p`
    font-size: 16px;
    margin-bottom: 8px;
`;

const Button = styled.button`
    padding: 0.5rem;
    background-color: #f9c003;
    color: black;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    width: 100%;

    &:hover {
        background-color: #e3af03;
        color: white;
    }
`;

function EventDetails() {
    const location = useLocation();
    const event: Event = location.state.event;
    const navigate = useNavigate();

    const handleButtonClick = () => {
        navigate("/edit-event", { state: { event } }); // Pass the event as state
    };

    return (
        <Wrapper>
            <Heading>{event.title}</Heading>
            <Label>
                Location:
                <Text>{event.location}</Text>
            </Label>
            <Label>
                Description:
                <Text>{event.description}</Text>
            </Label>
            <Label>
                Start Time:
                <Text>{new Date(event.startDate).toLocaleString()}</Text>
            </Label>
            <Label>
                End Time:
                <Text>{new Date(event.endDate).toLocaleString()}</Text>
            </Label>
            <Button onClick={handleButtonClick}>EDIT EVENT</Button>
        </Wrapper>
    );
}

export default EventDetails;
