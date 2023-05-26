import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Event, User } from "./types";
import axios from "axios";

// Wrapper for the entire page
const Wrapper = styled.div`
    // Styling for the wrapper
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    padding: 16px;
    width: 960px;
`;

// Heading for the page
const Heading = styled.h2`
    // Styling for the heading
    color: var(--otago-blue-dark);
`;

// Container for the event details
const Label = styled.label`
    // Styling for the label
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
    width: 100%;
`;

// Text for the event details
const Text = styled.p`
    // Styling for the text
    font-size: 16px;
    margin-bottom: 8px;
`;

// Container for the buttons
const ButtonContainer = styled.div`
    // Styling for the button container
    display: flex;
    gap: 8px;
`;

// Button for editing and deleting events
const Button = styled.button`
    // Styling for the button
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
    const event: Event = location.state.event; // Get the event object from the location state
    const isRecurring: boolean = location.state.isRecurring; // Check if the event is recurring
    const navigate = useNavigate();
    const [user, setUsers] = useState<User[]>([]); // State for storing user data

    const userData = sessionStorage.getItem("userData");
    const password = sessionStorage.getItem("password") || "";
    const isAdmin = userData ? JSON.parse(userData).isAdmin : false; // Check if the user is an admin

    let username = "";
    if (userData) {
        const user: User = JSON.parse(userData);
        username = user.email; // Get the username from user data
    }

    const authHeader = (username: string, password: string) => {
        const base64Credentials = btoa(`${username}:${password}`);
        return `Basic ${base64Credentials}`; // Generate the basic authentication header
    };

    const headers = {
        Authorization: authHeader(username, password), // Set the authorization header
    };

    const editEvent = () => {
        navigate("/edit-event", { state: { event } }); // Navigate to the edit event page and pass the event as state
    };

    useEffect(() => {
        const retrieveData = async () => {
            try {
                const userIdResponse = await axios.get(
                    `/event/${event.eventId}/assign`,
                    {
                        headers: {
                            Authorization: authHeader(username, password),
                        },
                    }
                );
                if (userIdResponse.data[0]) {
                    const user = userIdResponse.data;
                    setUsers(user); // Retrieve and set the assigned user data
                }
            } catch (error) {
                console.error(error);
            }
        };
        retrieveData();
    }, []);

    const deleteEvent = async () => {
        try {
            await axios.delete(`/event/${event.eventId}`, {
                headers: headers, // Send the authorization headers for deletion
            });
            navigate("/events"); // Navigate back to the events page after deletion
        } catch (error) {
            console.error(error);
        }
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
            <Label>
                Assigned User:
                <Text>
                    {user[0]
                        ? user[0].firstName + " " + user[0].lastName
                        : "None"}{" "}
                    {/* {Display the assigned user's full name or "None" if not assigned*/}
                </Text>
            </Label>

            {isAdmin && (
                <>
                    <ButtonContainer>
                        {!isRecurring && (
                            <Button onClick={editEvent}>EDIT EVENT</Button>
                        )}{" "}
                        {/* {Show the "EDIT EVENT" button only if the event is not recurring} */}
                        <Button onClick={deleteEvent}>DELETE EVENT</Button>
                    </ButtonContainer>
                </>
            )}
        </Wrapper>
    );
}

export default EventDetails;
