import React from "react";
import "./App.css";
import Login from "./Login";
import styled from "styled-components";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  font-family: "Open Sans", sans-serif;
`;

const Header = styled.header`
  background: var(--otago-blue-light);
  color: white;
  padding: 0.5em;
  height: 2.5em;
  font-size: 2em;
`;

const Main = styled.main`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 10px;
  justify-content: center;
`;
function App() {
  return (
    <Wrapper className="App">
      <Header>EventCalendar</Header>
      <Main>
        <Login />
      </Main>
    </Wrapper>
  );
}

export default App;
