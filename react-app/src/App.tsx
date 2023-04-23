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
  position: fixed;
  display: flex;
  align-items: center;
  top: 0;
  left: 0;
  background: var(--otago-blue-dark);
  color: white;
  height: 64px;
  font-size: 2em;
  width: 100%;
`;

const Main = styled.main`
  margin-top: 64px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 10px;
  justify-content: center;
`;

const NavBar = styled.nav``;

const App: React.FC = () => {
  return (
    <Wrapper className="App">
      <Header>
        <span>Event Calendar</span>
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
