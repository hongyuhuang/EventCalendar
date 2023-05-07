import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { Event } from "./EventCalendar";

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

const Form = styled.form`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
`;

const Label = styled.label`
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
    width: 100%;
`;

const Input = styled.input`
    padding: 0.5rem;
    margin-top: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
`;

const Textarea = styled.textarea`
    padding: 0.5rem;
    margin-top: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    resize: vertical;
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
interface EventFormData {
    title: string;
    location: string;
    startDate: Date;
    endDate: Date;
    description: string;
}

function EditEventForm({ username, password }: { username: string; password: string }) {
    const navigate = useNavigate();
    const location = useLocation();
    const event: Event = location.state.event;
    const [formData, setFormData] = useState<EventFormData>({
        title: event.title,
        location: event.location,
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
        description: event.description,
    });
    const handleChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = event.target;

        if (name === "startDate" || name === "endDate") {
            const date = new Date(value);
            setFormData({
                ...formData,
                [name]: date,
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    const authHeader = (username: string, password: string) => {
        const base64Credentials = btoa(`${username}:${password}`);
        return `Basic ${base64Credentials}`;
    };

    const headers = {
        Authorization: authHeader(username, password),
    };

    const handleSubmit = async (eventForm: React.FormEvent<HTMLFormElement>) => {
        eventForm.preventDefault();

        try {
            const response = await axios.patch(
                `http://localhost:3001/event/${event.eventId}`,
                formData,
                { headers: headers }
            );
            console.log(response.data);
            navigate("/events");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Wrapper>
            <Heading>Event Details</Heading>
            <Form onSubmit={handleSubmit}>
                <Label>
                    Title:
                    <Input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                    />
                </Label>
                <Label>
                    Location:
                    <Input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                    />
                </Label>
                <Label>
                    Start Date:
                    <Input
                        type="datetime-local"
                        name="startDate"
                        value={formData.startDate.toISOString().slice(0, 16)}
                        onChange={handleChange}
                    />
                </Label>
                <Label>
                    End Date:
                    <Input
                        type="datetime-local"
                        name="endDate"
                        value={formData.endDate.toISOString().slice(0, 16)}
                        onChange={handleChange}
                    />
                </Label>
                <Label>
                    Description:
                    <Textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                    />
                </Label>
                <Button type="submit">UPDATE EVENT</Button>
            </Form>
        </Wrapper>
    );
}

export default EditEventForm;
