import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { format } from "date-fns";
import { EventFormData, User, RepeatFormData } from "./types";

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

const Select = styled.select`
    padding: 0.5rem;
    margin-top: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
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

const RepeatSection = styled.div`
  margin-top: 1rem;
`;

const Dropdown = styled.select`
  padding: 0.5rem;
  margin-top: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
`;

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const CheckboxLabel = styled.span`
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
    repeatEndDate: format(new Date(), "yyyy-MM-dd'T'HH:mm")
}

function CreateEventForm() {
    const [formData, setFormData] = useState<EventFormData>(initialFormData);
    const [repeatData, setRepeatData] = useState<RepeatFormData>(initialRepeatData);
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState("");

    const userData = sessionStorage.getItem("userData");
    const password = sessionStorage.getItem("password") || "";

    let username = "";
    if (userData) {
        const user: User = JSON.parse(userData);
        username = user.email;
    }

    const authHeader = (username: string, password: string) => {
        const base64Credentials = btoa(`${username}:${password}`);
        return `Basic ${base64Credentials}`;
    };

    const headers = {
        Authorization: authHeader(username, password),
    };

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
            const response = await axios.post("/event", formData, {
                headers: headers,
            });
            const eventId = response.data.eventId;
            const userId = selectedUser;

            await axios.post(
                `/event/${eventId}/assign/${userId}`,
                {},
                { headers: headers }
            );

            if (repeatData.repeat) {
              const repeatPayload = {
                ...formData,
                repeatData: repeatData,
                eventId: response.data.eventId
              };

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

    <Label>
      Repeat:
      <Checkbox
        name="Repeat"
        checked={repeatData.repeat}
        onChange={handleChange}
      />
    </Label>
    {repeatData.repeat && (
      <RepeatSection>
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

    <Button type="submit">CREATE EVENT</Button>
  </Form>
</Wrapper>
    );
}

export default CreateEventForm;
