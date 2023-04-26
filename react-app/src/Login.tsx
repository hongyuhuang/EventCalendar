import React, { useState } from "react";
import { useFormik } from "formik";
import styled from "styled-components";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  background: var(--otago-grey-light);
  border: 2px solid var(--otago-grey-dark);
  border-radius: 5px;
  padding: 10px;
`;

const Label = styled.label`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  font-size: small;
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
  justify-content: center;
  align-items: center;
  gap: 10px;
`;

const Input = styled.input`
    border-radius: 5px;
    width: 200px;
`;

const Submit = styled.input`
    border-radius: 5px;    
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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const response = await axios.post('http://localhost:3001/register', formData);
      console.log(response.data);
      navigate('/user-list');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Wrapper>
      <Title>Welcome to EventCalendar</Title>
      <LoginHeading>Please login</LoginHeading>
      <Form id="login-form" onSubmit={handleSubmit}>
        <Label>
          Username:
          <Input
            id="username"
            type="text"
            name="username"
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
        <Submit type="submit" value="Submit" id="login-submit" />
      </Form>
    </Wrapper>
  );
};

export default Login;
