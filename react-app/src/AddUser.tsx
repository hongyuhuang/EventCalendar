import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const Label = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid gray;
  border-radius: 4px;
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

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

const initialFormData: UserFormData = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
};

function SignupForm() {
  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const navigate = useNavigate();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:3001/register",
        formData
      );
      console.log(response.data);
      navigate("/user-list");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Label>
        First Name:
        <Input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
        />
      </Label>
      <Label>
        Last Name:
        <Input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
        />
      </Label>
      <Label>
        Email:
        <Input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />
      </Label>
      <Label>
        Password:
        <Input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
        />
      </Label>
      <Button type="submit">Submit</Button>
    </Form>
  );
}

export default SignupForm;
