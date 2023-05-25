import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

// Wrapper component for the entire page
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
    align-items: center;
    gap: 1rem;
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

// ErrorMessage component for the error message
const ErrorMessage = styled.span`
    // Styling for the error message
    color: red;
`;

// Interface for the form data
interface UserFormData {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
}

// Initial form data
const initialFormData: UserFormData = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
};

function SignupForm() {
    // State for form data
    const [formData, setFormData] = useState<UserFormData>(initialFormData);
    const navigate = useNavigate();

    // State for error message
    const [errorMessage, setErrorMessage] = useState("");

    // Event handler for input changes
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });
    };

    // Event handler for form submission
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // Check if passwords match
        if (formData.password !== formData.confirmPassword) {
            setErrorMessage("Passwords do not match");
            return;
        }

        try {
            // Send form data to the server for registration
            const response = await axios.post("/register", formData);
            navigate("/user-list");
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Wrapper>
            <Heading>User Details</Heading>
            <Form onSubmit={handleSubmit}>
                {/* First Name */}
                <Label>
                    First Name:
                    <Input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                    />
                </Label>
                {/* Last Name */}
                <Label>
                    Last Name:
                    <Input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                    />
                </Label>
                {/* Email */}
                <Label>
                    Email:
                    <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                </Label>
                {/* New Password */}
                <Label>
                    New Password:
                    <Input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                </Label>
                {/* Confirm Password */}
                <Label>
                    Confirm Password:
                    <Input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                    />
                </Label>
                {/* Error Message */}
                <ErrorMessage>{errorMessage}</ErrorMessage>
                {/* Submit Button */}
                <Button type="submit">Create User</Button>
            </Form>
        </Wrapper>
    );
}

export default SignupForm;
