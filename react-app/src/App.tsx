import React from "react";
import "./App.css";
import Login from "./Login";
import styled from "styled-components";
import { Routes, Route, NavLink } from "react-router-dom";
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

const NavBar = styled.nav`
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
  &:hover {
    background: var(--otago-blue);
    color: white;
  }
  height: 100%;
  float: left;
  padding: 7px;

  &:active {
  background-color: white;
  }
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
  return (
    <Wrapper>
      <Header>
        <Logo
          src={process.env.PUBLIC_URL + "/images/university-of-otago-logo.png"}
          alt="University of Otago Logo"
        />
        <Title>Event Calendar</Title>
        <NavBar>
          <NavItem to={"/"}>Events</NavItem>
          <NavItem to={"/login"}>Login</NavItem>
        </NavBar>
      </Header>
      <Main>
        <Routes>
          <Route path="/" element={<EventCalendar events={undefined} />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Main>
    </Wrapper>
  );
};

export default App;
