import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface EventFormData {
    title: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
}

const initialFormData: EventFormData = {
    title: "",
    location: "",
    startDate: "",
    endDate: "",
    description: "",
};

function CreateEventForm() {
    const [formData, setFormData] = useState<EventFormData>(initialFormData);
    const navigate = useNavigate();

    const handleChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });
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
            navigate("/event-list");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <label>
                Title:
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                />
            </label>
            <label>
                Location:
                <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                />
            </label>
            <label>
                Start Date:
                <input
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                />
            </label>
            <label>
                End Date:
                <input
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                />
            </label>
            <label>
                Description:
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                />
            </label>
            <button type="submit">Submit</button>
        </form>
    );
}

export default CreateEventForm;
