import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { format } from "date-fns";
import { EventFormData, User, RepeatFormData } from "./types";

// Wrapper component for the entire page
const Wrapper = styled.div`
    // Styling for the wrapper
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    padding: 16px;
    width: 960px;
`;

// Heading component for the page heading
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

// Label component for the form labels
const Label = styled.label`
    // Styling for the form labels
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
    width: 100%;
`;

// Input component for the input fields
const Input = styled.input`
    // Styling for the input fields
    padding: 0.5rem;
    margin-top: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
`;

// Textarea component for the text area
const Textarea = styled.textarea`
    // Styling for the text area
    padding: 0.5rem;
    margin-top: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    resize: vertical;
`;

// Select component for the select dropdown
const Select = styled.select`
    // Styling for the select dropdown
    padding: 0.5rem;
    margin-top: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
`;

// Button component for the submit button
const Button = styled.button`
    // Styling for the submit button
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

// Error component for the error message
const RepeatSection = styled.div`
    //  Styling for the repeat section
    margin-top: 1rem;
`;

// Dropdown component for the repeat section heading
const Dropdown = styled.select`
    // Styling for the repeat section heading
    padding: 0.5rem;
    margin-top: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
`;

// Wrapper component for the checkboxes
const CheckboxWrapper = styled.div`
    // Styling for the repeat section heading
    display: flex;
    align-items: center;
`;

// Label component for the checkboxes
const CheckboxLabel = styled.span`
    // Styling for the repeat section heading
    margin-left: 0.5rem;
`;

const Checkbox = ({
    name,
    checked,
    onChange,
}: {
    name: string;
    checked: boolean;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
    <CheckboxWrapper>
        <Input
            type="checkbox"
            name={name}
            checked={checked}
            onChange={onChange}
        />
        <CheckboxLabel>{name}</CheckboxLabel>
    </CheckboxWrapper>
);

const initialFormData: EventFormData = {
    title: "",
    location: "",
    startDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    endDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    description: "",
};

const initialRepeatData: RepeatFormData = {
    repeat: false,
    repeatInterval: "daily",
    repeatEndDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
};

function CreateEventForm() {
    const [formData, setFormData] = useState<EventFormData>(initialFormData);
    const [repeatData, setRepeatData] =
        useState<RepeatFormData>(initialRepeatData);
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState("");

    // Get user data from session storage
    const userData = sessionStorage.getItem("userData");
    const password = sessionStorage.getItem("password") || "";

    let username = "";
    if (userData) {
        const user: User = JSON.parse(userData);
        username = user.email;
    }

    // Authorization header for API requests
    const authHeader = (username: string, password: string) => {
        const base64Credentials = btoa(`${username}:${password}`);
        return `Basic ${base64Credentials}`;
    };

    const headers = {
        Authorization: authHeader(username, password),
    };

    useEffect(() => {
        // Fetch users from the server
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

    const handleChange = (
        event: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const { name, value, type } = event.target;

        if (type === "checkbox") {
            const newValue = (event.target as HTMLInputElement).checked;
            if (name in repeatData) {
                setRepeatData({
                    ...repeatData,
                    [name]: newValue,
                });
            }
        } else {
            if (name in formData) {
                setFormData({
                    ...formData,
                    [name]: value,
                });
            }
            if (name in repeatData) {
                setRepeatData({
                    ...repeatData,
                    [name]: value,
                });
            }
        }
    };

    const handleSubmit = async (
        eventForm: React.FormEvent<HTMLFormElement>
    ) => {
        eventForm.preventDefault();

        try {
            // Create event
            const response = await axios.post("/event", formData, {
                headers: headers,
            });
            const eventId = response.data.eventId;
            const userId = selectedUser;

            // Assign event to user
            await axios.post(
                `/event/${eventId}/assign/${userId}`,
                {},
                { headers: headers }
            );

            if (repeatData.repeat) {
                const repeatPayload = {
                    ...formData,
                    repeatData: repeatData,
                    eventId: response.data.eventId,
                };

                // Create repeating event
                await axios.post(
                    `http://localhost:3001/event/${eventId}/repeat`,
                    repeatPayload,
                    { headers: headers }
                );
            }

            navigate("/events");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Wrapper>
            <Heading>Event Details</Heading>
            <Form onSubmit={handleSubmit}>
                {/* Title */}
                <Label>
                    Title:
                    <Input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                    />
                </Label>
                {/* Location */}
                <Label>
                    Location:
                    <Input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                    />
                </Label>
                {/* Start Date */}
                <Label>
                    Start Date:
                    <Input
                        type="datetime-local"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                    />
                </Label>
                {/* End Date */}
                <Label>
                    End Date:
                    <Input
                        type="datetime-local"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                    />
                </Label>

                {/* Description */}
                <Label>
                    Description:
                    <Textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                    />
                </Label>
                {/* User */}
                <Label>
                    User:
                    <Select
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                        required
                    >
                        <option value="">Select a user</option>
                        {users.map((user) => (
                            <option key={user.userId} value={user.userId}>
                                {user.firstName + " " + user.lastName}
                            </option>
                        ))}
                    </Select>
                </Label>

                {/* Repeat Checkbox */}
                <Label>
                    Repeat:
                    <Checkbox
                        name="repeat"
                        checked={repeatData.repeat}
                        onChange={handleChange}
                    />
                </Label>
                {/* Repeat Section */}
                {repeatData.repeat && (
                    <RepeatSection>
                        {/* Repeat Interval */}
                        <Label>
                            Repeat Interval:
                            <Dropdown
                                name="repeatInterval"
                                value={repeatData.repeatInterval}
                                onChange={handleChange}
                            >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="fortnightly">Fortnightly</option>
                                <option value="monthly">Monthly</option>
                                <option value="yearly">Yearly</option>
                            </Dropdown>
                        </Label>
                        {/* Repeat End Date */}
                        <Label>
                            Repeat End Date:
                            <Input
                                type="datetime-local"
                                name="repeatEndDate"
                                value={repeatData.repeatEndDate}
                                onChange={handleChange}
                            />
                        </Label>
                    </RepeatSection>
                )}

                {/* Submit Button */}
                <Button type="submit">CREATE EVENT</Button>
            </Form>
        </Wrapper>
    );
}

export default CreateEventForm;
