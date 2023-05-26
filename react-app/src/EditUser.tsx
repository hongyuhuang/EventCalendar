import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { User } from "./types";

const header = require("basic-auth-header");

// Wrapper for the entire page
const Wrapper = styled.div`
    // Styling for the wrapper
    background-color: #ffffff;
    border-radius: 8px;
    -webkit-box-shadow: 0 4px 6px rgba(0, 0, 0, 0.7);
    -moz-box-shadow: 0 4px 6px rgba(0, 0, 0, 0.7);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    padding: 16px;
    width: 960px;
`;

// Heading for the page
const Heading = styled.h2`
    // Styling for the heading
    color: var(--otago-blue-dark);
`;

// Form for editing user details
const Form = styled.form`
    // Styling for the form
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
`;

// Label for the form
const Label = styled.label`
    // Styling for the label
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
    width: 100%;
`;

// Input for the form
const Input = styled.input`
    // Styling for the input
    padding: 0.5rem;
    margin-top: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
`;

// Button for submitting the form
const Button = styled.button`
    // Styling for the button
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

// Error message for the form
const ErrorMessage = styled.span`
    // Styling for the error message
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
    const user: User = location.state.user; // Get the user object from the location state

    const [formData, setFormData] = useState<UserFormData>({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: "",
        confirmPassword: "",
    });
    const navigate = useNavigate();

    const [errorMessage, setErrorMessage] = useState(""); // State for displaying error messages

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        }); // Update form data when input values change
    };
    const userData = sessionStorage.getItem("userData");
    const password = sessionStorage.getItem("password") || "";

    let username = "";
    if (userData) {
        const loggedInUser: User = JSON.parse(userData);
        username = loggedInUser.email; // Get the username from logged-in user data
    }

    const headers = {
        Authorization: header(username, password), // Set the authorization header using basic-auth-header
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setErrorMessage("Passwords do not match"); // Display an error message if passwords don't match
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
                { headers: headers } // Send a PATCH request to update user details
            );

            if (formData.password.length > 0) {
                console.log(`New password (react): ${formData.password}`);
                await axios.patch(
                    `/user/${user.userId}/password`,
                    {
                        newPassword: formData.password,
                    },
                    { headers: headers } // Send a PATCH request to update the user's password if a new password is provided
                );
            }

            navigate("/user-list"); // Navigate to the user list page after successful update
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
                {/* {Display the error message if present} */}
                <Button type="submit">Update User</Button>
            </Form>
        </Wrapper>
    );
}

export default EditUserForm;
