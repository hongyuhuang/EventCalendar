import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { User } from "./types";

const header = require("basic-auth-header");

const Wrapper = styled.div`
    background-color: #ffffff;
    border-radius: 8px;
    -webkit-box-shadow: 0 4px 6px rgba(0, 0, 0, 0.7);
    -moz-box-shadow: 0 4px 6px rgba(0, 0, 0, 0.7);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    padding: 16px;
    width: 960px;
`;

const Heading = styled.h2`
    color: var(--otago-blue-dark);
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
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

const ErrorMessage = styled.span`
    color: red;
`;

interface UserFormData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
}

function EditUserForm() {
    const location = useLocation();
    const user: User = location.state.user;

    const [formData, setFormData] = useState<UserFormData>({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: "",
        confirmPassword: "",
    });
    const navigate = useNavigate();

    const [errorMessage, setErrorMessage] = useState("");

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });
    };
    const userData = sessionStorage.getItem("userData");
    const password = sessionStorage.getItem("password") || "";

    let username = "";
    if (userData) {
        const loggedInUser: User = JSON.parse(userData);
        username = loggedInUser.email;
    }

    const headers = {
        Authorization: header(username, password),
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setErrorMessage("Passwords do not match");
            return;
        }

        try {
            await axios.patch(
                `/user/${user.userId}`,
                {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                },
                { headers: headers }
            );

            if (formData.password.length > 0) {
                console.log(`New password (react): ${formData.password}`);
                await axios.patch(
                    `/user/${user.userId}/password`,
                    {
                        newPassword: formData.password,
                    },
                    { headers: headers }
                );
            }

            navigate("/user-list");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Wrapper>
            <Heading>User Details</Heading>
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
                    New Password:
                    <Input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                </Label>
                <Label>
                    Confirm Password:
                    <Input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                    />
                </Label>
                <ErrorMessage>{errorMessage}</ErrorMessage>
                <Button type="submit">Update User</Button>
            </Form>
        </Wrapper>
    );
}

export default EditUserForm;
