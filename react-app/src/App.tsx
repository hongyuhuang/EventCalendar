import React, { useState } from "react";
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
    position: fixed;
    background: var(--otago-grey-dark);
    width: 100%;
    top: 70px;
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

const SignOutButton = styled.button`
    color: white;
    background-color: transparent;
    border: none;
    cursor: pointer;
    margin-left: auto;
    font-size: 14px;
    margin-right: 10px;

    &:hover {
        text-decoration: underline;
    }
`;

const App: React.FC = () => {
    const userData = sessionStorage.getItem("userData");
    const isLoggedIn = sessionStorage.getItem("loggedIn") === "true";
    const isAdmin = userData ? JSON.parse(userData).isAdmin : false;
    const navigate = useNavigate();

    const location = useLocation();
    const currentPath = location.pathname;

    const isLinkActive = (linkPath: string) => {
        return linkPath === "/"
            ? currentPath === linkPath
            : currentPath.startsWith(linkPath);
    };

    const handleSignOut = () => {
        sessionStorage.removeItem("userData");
        sessionStorage.removeItem("password");
        sessionStorage.removeItem("loggedIn");
        navigate("/");
    };

    return (
        <Wrapper>
            <Header>
                <Logo
                    src={"/images/university-of-otago-logo.png"}
                    alt="University of Otago Logo"
                />
                <Title>Event Calendar</Title>
                {isLoggedIn && (
                    <>
                        <SignOutButton onClick={handleSignOut}>
                            Sign Out
                        </SignOutButton>
                    </>
                )}
            </Header>
            <Nav>
                {isLoggedIn && (
                    <>
                        <NavItem
                            to={"/events"}
                            className={isLinkActive("/events") ? "active" : ""}
                        >
                            Events
                        </NavItem>
                        {isAdmin && (
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
            <Main>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <Login
                            />
                        }
                    />
                    {isLoggedIn && (
                        <>
                            <Route
                                path="/events"
                                element={
                                    <EventCalendar
                                    />
                                }
                            />
                            {isAdmin && (
                                <>
                                    <Route
                                        path="/add-user"
                                        element={<SignupForm />}
                                    />
                                    <Route
                                        path="/add-event"
                                        element={
                                            <CreateEventForm

                                            />
                                        }
                                    />
                                    <Route
                                        path="/user-list"
                                        element={
                                            <UserList
                                            />
                                        }
                                    />
                                </>
                            )}
                            <Route
                                path="/event-details"
                                element={
                                    <EventDetails
                                    />
                                }
                            />
                            <Route
                                path="/edit-event"
                                element={
                                    <EditEventForm
                                    />
                                }
                            />
                        </>
                    )}
                </Routes>
            </Main>
        </Wrapper>
    );
};

export default App;
