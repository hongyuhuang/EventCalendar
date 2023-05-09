import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { format } from 'date-fns';
import { Event, User } from "./types";

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

const Select = styled.select`
    padding: 0.5rem;
    margin-top: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
`;

interface EventFormData {
    title: string;
    location: string;
    startDate: string;
    endDate: string;
    description: string;
}

function EditEventForm({
    username,
    password,
}: {
    username: string;
    password: string;
}) {
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

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get("http://localhost:3001/user", {
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

    useEffect(() => {
        const retrieveData = async () => {
          try {
            const userIdResponse = await axios.get(`http://localhost:3001/event/${event.eventId}/users`, {
              headers: {
                Authorization: authHeader(username, password),
              },
            });
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

    const handleChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const authHeader = (username: string, password: string) => {
        const base64Credentials = btoa(`${username}:${password}`);
        return `Basic ${base64Credentials}`;
    };

    const headers = {
        Authorization: authHeader(username, password),
    };

    const handleSubmit = async (
        eventForm: React.FormEvent<HTMLFormElement>
    ) => {
        eventForm.preventDefault();

        try {
            const response = await axios.patch(
                `http://localhost:3001/event/${event.eventId}`,
                formData,
                { headers: headers }
            );
            // console.log(response.data);
            
            //try catch is definetly not the way to go about this. but its 8pm and ive been working all day
            try {
                const response2 = await axios.delete(
                    `http://localhost:3001/event/${event.eventId}/attendance/${assignedUserId}`,
                    {headers: headers }
                )
                // console.log(response2.data);
            }catch(err){
                
            }

            const response3 = await axios.post(
                `http://localhost:3001/event/${event.eventId}/assign/${selectedUser}`,
                {},
                {headers: headers}
            )
            // console.log(response3.data);
            
            
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
                        value={formData.startDate}
                        onChange={handleChange}
                    />
                </Label>
                <Label>
                    End Date:
                    <Input
                        type="datetime-local"
                        name="endDate"
                        value={formData.endDate}
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
                <Label>
                    User:
                    <Select
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                        >
                        <option value="">Select a user</option>
                        {users.map((user) => (
                            <option
                            key={user.userId}
                            value={user.userId}
                            >
                            {user.firstName} {user.lastName}
                            </option>
                        ))}
                        </Select>
                </Label>
                <Button type="submit">UPDATE EVENT</Button>
            </Form>
        </Wrapper>
    );
}

export default EditEventForm;
