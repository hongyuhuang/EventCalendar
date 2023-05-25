import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { format } from "date-fns";
import { Event, User } from "./types";

// Wrapper component for the form
const Wrapper = styled.div`
    // Styling for the wrapper
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    padding: 16px;
    width: 960px;
`;

// Heading component for the form heading
const Heading = styled.h2`
    // Styling for the heading
    color: var(--otago-blue-dark);
`;

// Form component for the form
const Form = styled.form`
    // Styling for the form
    display: flex;
    flex-direction: column;
    align-items: flex-start;
`;

// Label component for form labels
const Label = styled.label`
    // Styling for the label
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
    width: 100%;
`;

// Input component for form inputs
const Input = styled.input`
    // Styling for the input
    padding: 0.5rem;
    margin-top: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
`;

// Textarea component for form textarea
const Textarea = styled.textarea`
    // Styling for the textarea
    padding: 0.5rem;
    margin-top: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    resize: vertical;
`;

// Button component for form button
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

// Select component for form select
const Select = styled.select`
    // Styling for the select
    padding: 0.5rem;
    margin-top: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
`;

// Interface for the event form data
interface EventFormData {
    title: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
}

function EditEventForm() {
    const navigate = useNavigate();
    const location = useLocation();
    const event: Event = location.state.event;
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState("");
    const [assignedUserId, setAssignedUserId] = useState("");
    const [formData, setFormData] = useState<EventFormData>({
        title: event.title,
        location: event.location,
        startDate: format(new Date(event.startDate), "yyyy-MM-dd'T'HH:mm"),
        endDate: format(new Date(event.endDate), "yyyy-MM-dd'T'HH:mm"),
        description: event.description,
    });

    // Get user data from session storage
    const userData = sessionStorage.getItem("userData");
    const password = sessionStorage.getItem("password") || "";

    let username = "";
    if (userData) {
        const user: User = JSON.parse(userData);
        username = user.email;
    }

    // Fetch users data from the server
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get("/user", {
                    headers: {
                        Authorization: authHeader(username, password),
                    },
                });
                setUsers(response.data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchUsers();
    }, [username, password]);

    // Retrieve assigned user data for the event
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
                    setSelectedUser(userIdResponse.data[0].userId);
                    setAssignedUserId(userIdResponse.data[0].userId);
                }
            } catch (error) {
                console.error(error);
            }
        };
        retrieveData();
    }, [event]);

    // Handle form input changes
    const handleChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    // Generate authorization header
    const authHeader = (username: string, password: string) => {
        const base64Credentials = btoa(`${username}:${password}`);
        return `Basic ${base64Credentials}`;
    };

    const headers = {
        Authorization: authHeader(username, password),
    };

    // Handle form submission
    const handleSubmit = async (
        eventForm: React.FormEvent<HTMLFormElement>
    ) => {
        eventForm.preventDefault();

        try {
            const response = await axios.patch(
                `/event/${event.eventId}`,
                formData,
                { headers: headers }
            );

            try {
                const response2 = await axios.delete(
                    `/event/${event.eventId}/assign/${assignedUserId}`,
                    { headers: headers }
                );
            } catch (err) {}

            const response3 = await axios.post(
                `/event/${event.eventId}/assign/${selectedUser}`,
                {},
                { headers: headers }
            );

            navigate("/events");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Wrapper>
            {/* Form heading */}
            <Heading>Event Details</Heading>
            <Form onSubmit={handleSubmit}>
                {/* Title input */}
                <Label>
                    Title:
                    <Input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                    />
                </Label>
                {/* Location input */}
                <Label>
                    Location:
                    <Input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                    />
                </Label>
                {/* Start Date input */}
                <Label>
                    Start Date:
                    <Input
                        type="datetime-local"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                    />
                </Label>
                {/* End Date input */}
                <Label>
                    End Date:
                    <Input
                        type="datetime-local"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                    />
                </Label>
                {/* Description textarea */}
                <Label>
                    Description:
                    <Textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                    />
                </Label>
                {/* User select */}
                <Label>
                    User:
                    <Select
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                        required
                    >
                        <option value="">Select a user</option>
                        {/* Map over users and generate options */}
                        {users.map((user) => (
                            <option key={user.userId} value={user.userId}>
                                {user.firstName} {user.lastName}
                            </option>
                        ))}
                    </Select>
                </Label>
                {/* Submit button */}
                <Button type="submit">UPDATE EVENT</Button>
            </Form>
        </Wrapper>
    );
}

export default EditEventForm;
