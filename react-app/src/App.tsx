import React, { useEffect, useState } from "react";
import "./App.css";
import Login from "./Login";
import styled from "styled-components";
import {
    Routes,
    Route,
    NavLink,
    useLocation,
    useNavigate,
} from "react-router-dom";
import EventCalendar from "./EventCalendar";
import SignupForm from "./AddUser";
import EventDetails from "./EventDetails";
import CreateEventForm from "./AddEvent";
import UserList from "./UserList";
import EditEventForm from "./EditEvent";
import EditUserForm from "./EditUser";

// Wrapper component for the entire app
const Wrapper = styled.div`
    // Styling for the wrapper
    display: flex;
    flex-direction: column;
    font-family: "Open Sans", sans-serif;
`;

// Header component
const Header = styled.header`
    // Styling for the header
    &::before {
        // Styling for the top border
        content: "";
        display: block;
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 3px;
        background-color: var(--otago-yellow);
    }
    position: fixed;
    display: flex;
    align-items: center;
    top: 0;
    left: 0;
    background: var(--otago-blue-dark);
    color: white;
    height: 70px;
    font-size: 24px;
    width: 100%;
    z-index: 9999;
`;

// Logo component for the university logo
const Logo = styled.img`
    // Styling for the logo
    height: 70px;
`;

// Title component for the app title
const Title = styled.span`
    // Styling for the title
    padding-left: 10px;
`;

// Navigation component
const Nav = styled.nav`
    // Styling for the navigation
    position: fixed;
    background: var(--otago-grey-dark);
    width: 100%;
    top: 70px;
    left: 0;
`;

// NavLink component for navigation links
const NavItem = styled(NavLink)`
    // Styling for the navigation item
    color: var(--otago-blue);
    text-decoration: none;
    font-size: 15px;
    padding: 10px;
    &.active {
        // Styling for the active link
        background-color: white;
        color: var(--otago-blue-dark);
    }
    &:hover {
        // Styling for the hovered link
        background: var(--otago-blue);
        color: white;
    }
    height: 100%;
    float: left;
`;

// Main component for the main content area
const Main = styled.main`
    // Styling for the main content
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 10px;
    justify-content: center;
    margin-top: 108.5px;
`;

// SignOutButton component for the sign out button
const SignOutButton = styled.button`
    // Styling for the sign out button
    color: white;
    background-color: transparent;
    border: none;
    cursor: pointer;
    margin-left: auto;
    font-size: 14px;
    margin-right: 10px;

    &:hover {
        // Styling for the hovered button
        text-decoration: underline;
    }
`;

const App: React.FC = () => {
    // Check if user is logged in and if the user is an admin
    const userData = sessionStorage.getItem("userData");
    const isLoggedIn = sessionStorage.getItem("loggedIn") === "true";
    const isAdmin = userData ? JSON.parse(userData).isAdmin : false;
    const navigate = useNavigate();

    // Get the current location
    const location = useLocation();
    const currentPath = location.pathname;

    // Function to check if a link is active
    const isLinkActive = (linkPath: string) => {
        return linkPath === "/"
            ? currentPath === linkPath
            : currentPath.startsWith(linkPath);
    };

    // Handle sign out action
    const handleSignOut = () => {
        // Clear session storage and navigate to the login page
        sessionStorage.removeItem("userData");
        sessionStorage.removeItem("password");
        sessionStorage.removeItem("loggedIn");
        navigate("/");
    };

    // Clear session storage on component unmount
    useEffect(() => {
        const handleBeforeUnload = () => {
            sessionStorage.clear();
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);

    return (
        <Wrapper>
            {/* Header */}
            <Header>
                <Logo
                    src={"/images/university-of-otago-logo.png"}
                    alt="University of Otago Logo"
                />
                <Title>Event Calendar</Title>
                {isLoggedIn && (
                    // Display sign out button if user is logged in
                    <>
                        <SignOutButton onClick={handleSignOut}>
                            Sign Out
                        </SignOutButton>
                    </>
                )}
            </Header>
            {/* Navigation */}
            <Nav>
                {isLoggedIn && (
                    <>
                        {/* Events link */}
                        <NavItem
                            to={"/events"}
                            className={isLinkActive("/events") ? "active" : ""}
                        >
                            Events
                        </NavItem>
                        {isAdmin && (
                            <>
                                {/* Add Event link */}
                                <NavItem
                                    to={"/add-event"}
                                    className={
                                        isLinkActive("/add-event")
                                            ? "active"
                                            : ""
                                    }
                                >
                                    Add Event
                                </NavItem>
                                {/* Manage Users link */}
                                <NavItem
                                    to={"/user-list"}
                                    className={
                                        isLinkActive("/user-list")
                                            ? "active"
                                            : ""
                                    }
                                >
                                    Manage Users
                                </NavItem>
                                {/* Add User link */}
                                <NavItem
                                    to={"/add-user"}
                                    className={
                                        isLinkActive("/add-user")
                                            ? "active"
                                            : ""
                                    }
                                >
                                    Add User
                                </NavItem>
                            </>
                        )}
                    </>
                )}
            </Nav>
            {/* Main Content */}
            <Main>
                <Routes>
                    {/* Login route */}
                    <Route path="/" element={<Login />} />
                    {isLoggedIn && (
                        <>
                            {/* Event Calendar route */}
                            <Route path="/events" element={<EventCalendar />} />
                            {isAdmin && (
                                <>
                                    {/* Add User route */}
                                    <Route
                                        path="/add-user"
                                        element={<SignupForm />}
                                    />
                                    {/* Add Event route */}
                                    <Route
                                        path="/add-event"
                                        element={<CreateEventForm />}
                                    />
                                    {/* User List route */}
                                    <Route
                                        path="/user-list"
                                        element={<UserList />}
                                    />
                                </>
                            )}
                            {/* Event Details route */}
                            <Route
                                path="/event-details"
                                element={<EventDetails />}
                            />
                            {/* Edit Event route */}
                            <Route
                                path="/edit-event"
                                element={<EditEventForm />}
                            />
                            {/* Edit User route */}
                            <Route
                                path="/edit-user"
                                element={<EditUserForm />}
                            />
                        </>
                    )}
                </Routes>
            </Main>
        </Wrapper>
    );
};

export default App;
