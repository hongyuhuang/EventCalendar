import React from "react";
import "./App.css";
import Login from "./Login";
import styled from "styled-components";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./Events";
import About from "./About";
import Events from "./Events";

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
`;

const Logo = styled.img`
  height: 70px;
`;

const Title = styled.span`
  padding-left: 10px;
`;

const Main = styled.main`
  margin-top: 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 10px;
  justify-content: center;
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
      </Header>
      <Main>
        <nav>
          <ul>
            <li>
              <Link to={"/"}> Login </Link>
            </li>
            <li>
              <Link to={"/events"}>Events</Link>
            </li>
            <li>
              <Link to={"/about"}>About</Link>
            </li>
          </ul>
        </nav>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/events" element={<Events />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Main>
    </Wrapper>
  );
};

export default App;
