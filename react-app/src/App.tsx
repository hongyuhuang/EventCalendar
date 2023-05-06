import React, { useEffect, useState } from "react";
import "./App.css";
import Login from "./Login";
import styled from "styled-components";
import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import EventCalendar from "./EventCalendar";
import SignupForm from "./AddUser";
import EventDetails from "./EventDetails";
import CreateEventForm from "./AddEvent";
import UserList from "./UserList";

const Wrapper = styled.div`
    display: flex;
    flex-direction: column;
    font-family: "Open Sans", sans-serif;
`;

const Header = styled.header`
    &::before {
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

const Logo = styled.img`
    height: 70px;
`;

const Title = styled.span`
    padding-left: 10px;
`;

const Nav = styled.nav`
    position: absolute;
    background: var(--otago-grey-dark);
    width: 100%;
    margin-top: 70px;
    top: 0;
    left: 0;
`;

const NavItem = styled(NavLink)`
    color: var(--otago-blue);
    text-decoration: none;
    font-size: 15px;
    padding: 10px;
    &.active {
        background-color: white;
        color: var(--otago-blue-dark);
    }
    &:hover {
        background: var(--otago-blue);
        color: white;
    }
    height: 100%;
    float: left;
`;

const Main = styled.main`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 10px;
    justify-content: center;
    margin-top: 108.5px;
`;

const App: React.FC = () => {
    const [loggedIn, setLoggedIn] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const location = useLocation();
    const currentPath = location.pathname;
    const userRole = "admin"; // TODO: Replace this with the actual user role

    const isLinkActive = (linkPath: string) => {
        return linkPath === "/"
            ? currentPath === linkPath
            : currentPath.startsWith(linkPath);
    };

    return (
        <Wrapper>
            <Header>
                <Logo
                    src={"/images/university-of-otago-logo.png"}
                    alt="University of Otago Logo"
                />
                <Title>Event Calendar</Title>
                <Nav>
                    {loggedIn === true && (
                        <>
                            <NavItem
                                to={"/events"}
                                className={
                                    isLinkActive("/events") ? "active" : ""
                                }
                            >
                                Events
                            </NavItem>
                            {userRole === "admin" && (
                                <>
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
            </Header>
            <Main>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <Login
                                setLoggedIn={setLoggedIn}
                                setUsername={setUsername}
                                setPassword={setPassword}
                            />
                        }
                    />
                    {loggedIn === true && (
                        <>
                            <Route path="/events" element={<EventCalendar username={username} password={password} />} />
                            {userRole === "admin" && (
                                <>
                                    <Route
                                        path="/add-user"
                                        element={<SignupForm />}
                                    />
                                    <Route
                                        path="/add-event"
                                        element={
                                            <CreateEventForm
                                                username={username}
                                                password={password}
                                            />
                                        }
                                    />
                                    <Route
                                        path="/user-list"
                                        element={
                                            <UserList
                                                username={username}
                                                password={password}
                                            />
                                        }
                                    />
                                </>
                            )}
                            <Route
                                path="/event-details"
                                element={<EventDetails />}
                            />
                        </>
                    )}
                </Routes>
            </Main>
        </Wrapper>
    );
};

export default App;
