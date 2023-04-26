import React, { useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Wrapper = styled.div`
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    padding: 16px;
    width: 960px;
`;

const Label = styled.label`
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
    width: 100%;
`;

const Title = styled.h1`
  color: var(--otago-blue-dark);
  font-size: 2em;
`;

const LoginHeading = styled.h2`
  color: var(--otago-blue-dark);
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
`;

const Input = styled.input`
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

interface LoginFormData {
  email: string;
  password: string;
}

const initialFormData: LoginFormData = {
  email: '',
  password: ''
};

function Login() {
  const [formData, setFormData] = useState<LoginFormData>(initialFormData);
  const navigate = useNavigate();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
      const response = await axios.post('http://localhost:3001/login', formData, {headers: headers});
      console.log(response.data);
      navigate('/user-list');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Wrapper>
      <Title>Welcome to Event Calendar</Title>
      <LoginHeading>Please login</LoginHeading>
      <Form id="login-form" onSubmit={handleSubmit}>
        <Label>
          Email:
          <Input
            id="email"
            type="email"
            name="email"
            onChange={handleChange}
            value={formData.email}
          />
        </Label>
        <Label>
          Password:
          <Input
            id="password"
            type="password"
            name="password"
            onChange={handleChange}
            value={formData.password}
          />
        </Label>
        <Button type="submit">LOG IN</Button>
      </Form>
    </Wrapper>
  );
};

export default Login;
