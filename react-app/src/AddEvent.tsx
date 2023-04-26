import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const Form = styled.form`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
`;

const Label = styled.label`
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
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
    border: 1px;
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

const initialFormData: EventFormData = {
    title: "",
    location: "",
    startDate: new Date(),
    endDate: new Date(),
    description: "",
};

function CreateEventForm() {
    const [formData, setFormData] = useState<EventFormData>(initialFormData);
    const navigate = useNavigate();

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

    const username = "johndoe@email.com";
    const password = "password123";

    const headers = {
        Authorization: authHeader(username, password),
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            const response = await axios.post(
                "http://localhost:3001/event",
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
            <Button type="submit">Submit</Button>
        </Form>
    );
}

export default CreateEventForm;