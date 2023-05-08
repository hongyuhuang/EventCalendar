import React, { useRef, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import ReCAPTCHA from "react-google-recaptcha";
import { User } from "./types";
const dotenv = require("dotenv");
dotenv.config();

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

const ErrorMessage = styled.span`
    color: red;
`;

interface LoginFormData {
    email: string;
    password: string;
}

const initialFormData: LoginFormData = {
    email: "",
    password: "",
};
interface LoginProps {
    setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
    setIsAdmin: React.Dispatch<React.SetStateAction<boolean>>;
    setUsername: React.Dispatch<React.SetStateAction<string>>;
    setPassword: React.Dispatch<React.SetStateAction<string>>;
}

const Login: React.FC<LoginProps> = ({
    setLoggedIn,
    setIsAdmin,
    setUsername,
    setPassword,
}) => {
    const [formData, setFormData] = useState<LoginFormData>(initialFormData);
    const navigate = useNavigate();

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });
    };

    const mounted = useRef(true);

    const recaptchaRef = useRef<ReCAPTCHA>(null);
    const reCaptchaSiteKey = "6LfWCMglAAAAACnMy3Ma_Kp_9nJPHPZOQj2Y-8jC";

    const authHeader = (username: string, password: string) => {
        const base64Credentials = btoa(`${username}:${password}`);
        return `Basic ${base64Credentials}`;
    };

    const username = formData.email;
    const password = formData.password;

    const headers = {
        Authorization: authHeader(username, password),
    };

    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            // Using reCaptcha
            // @ts-ignore
            const token = recaptchaRef.current.getValue();
            // @ts-ignore
            recaptchaRef.current.reset();

            if (!token) {
                setErrorMessage("Please complete the reCaptcha"); // Set error message
                return;
            }

            // Actually logging in
            const response = await axios.get("http://localhost:3001/login", {
                headers: headers,
                params: { "g-recaptcha-response": token },
            });

            // Check if the logged-in user is an admin
            const includeAdmins = true; // Set to true to include admins in the response
            const isAdminResponse = await axios.get(
                "http://localhost:3001/users",
                {
                    headers: headers,
                    params: { includeAdmins },
                }
            );
            const isAdmin = isAdminResponse.data.some(
                (user: User) => user.email === username && user.isAdmin
            );
            console.log(response.data);
            setLoggedIn(true);
            setIsAdmin(isAdmin);
            setUsername(username);
            setPassword(password);
            navigate("/events");
        } catch (error) {
            console.error(error);
            // @ts-ignore
            const response = error.response;
            if (response && response.status == 422) {
                setErrorMessage("reCaptcha validation failed"); // Set error message
            } else {
                setErrorMessage("Invalid email or password. Please try again."); // Set error message
            }
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
                <ErrorMessage>{errorMessage}</ErrorMessage>
                <ReCAPTCHA
                    className="recaptcha"
                    ref={recaptchaRef}
                    sitekey={reCaptchaSiteKey}
                />
                <Button type="submit">LOG IN</Button>
            </Form>
        </Wrapper>
    );
};

export default Login;
