import React from "react";
import "./App.css";
import Login from "./Login";
import styled from "styled-components";
import { Routes, Route, NavLink, useLocation } from "react-router-dom";
import EventCalendar from "./Events";

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
  color: var(--otago-blue-dark);
  text-decoration: none;
  font-size: 15px;
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
  padding: 7px;
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
        </Nav>
      </Header>
      <Main>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/events"
            element={<EventCalendar events={undefined} />}
          />
        </Routes>
      </Main>
    </Wrapper>
  );
};

export default App;
