import React from "react";
import "./App.css";
import Login from "./Login";
import styled from "styled-components";
import {
  Routes,
  Route,
  NavLink,
  useLocation,
  UNSAFE_useScrollRestoration,
} from "react-router-dom";
import EventCalendar, { CalendarEvent } from "./EventCalendar";
import SignupForm from "./AddUser";
import UserList, { User } from "./UserList";
import EventDetails from "./EventDetails";

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
    background-color: #f9c000;
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
  const location = useLocation();
  const currentPath = location.pathname;

  const isLinkActive = (linkPath: string) => {
    return linkPath === "/"
      ? currentPath === linkPath
      : currentPath.startsWith(linkPath);
  };

  const events: CalendarEvent[] = [
    {
      title: "Event 1",
      start: new Date(2023, 3, 28, 10, 0),
      end: new Date(2023, 3, 28, 12, 0),
      location: "Room 1",
    },
    {
      title: "Event 2",
      start: new Date(2023, 3, 29, 14, 0),
      end: new Date(2023, 3, 29, 16, 0),
      location: "Room 2",
    },
    {
      title: "Event 3",
      start: new Date(2023, 3, 30, 9, 0),
      end: new Date(2023, 3, 30, 11, 0),
      location: "Room 3",
    },
    {
      title: "Event 4",
      start: new Date(2023, 4, 1, 13, 0),
      end: new Date(2023, 4, 1, 15, 0),
      location: "Room 4",
    },
    {
      title: "Event 5",
      start: new Date(2023, 4, 2, 16, 0),
      end: new Date(2023, 4, 2, 18, 0),
      location: "Room 5",
    },
  ];

  // TODO: Link to back end
  const users: User[] = [
    {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
    },
    {
      id: 2,
      firstName: "Jane",
      lastName: "Doe",
      email: "jane.doe@example.com",
    },
    {
      id: 3,
      firstName: "Bob",
      lastName: "Smith",
      email: "bob.smith@example.com",
    },
    {
      id: 4,
      firstName: "Alice",
      lastName: "Jones",
      email: "alice.jones@example.com",
    },
    {
      id: 5,
      firstName: "Tom",
      lastName: "Brown",
      email: "tom.brown@example.com",
    },
  ];

  return (
    <Wrapper>
      <Header>
        <Logo
          src={process.env.PUBLIC_URL + "/images/university-of-otago-logo.png"}
          alt="University of Otago Logo"
        />
        <Title>Event Calendar</Title>
        <Nav>
          <NavItem to={"/"} className={isLinkActive("/") ? "active" : ""}>
            Login
          </NavItem>
          <NavItem
            to={"/events"}
            className={isLinkActive("/events") ? "active" : ""}
          >
            Events
          </NavItem>
          <NavItem
            to={"/add-user"}
            className={isLinkActive("/add-user") ? "active" : ""}
          >
            Add User
          </NavItem>
          <NavItem
            to={"/user-list"}
            className={isLinkActive("/user-list") ? "active" : ""}
          >
            Manage Users
          </NavItem>
        </Nav>
      </Header>
      <Main>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/events" element={<EventCalendar events={events} />} />
          <Route path="/add-user" element={<SignupForm />} />
          <Route path="/user-list" element={<UserList users={users} />} />
          <Route path="/event-details" element={<EventDetails />}></Route>
          UserList
        </Routes>
      </Main>
    </Wrapper>
  );
};

export default App;
