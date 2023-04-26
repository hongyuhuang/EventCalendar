import React from "react";
import { useFormik } from "formik";
import styled from "styled-components";
import axios from "axios";

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  background: var(--otago-grey-light);
  border: 2px solid var(--otago-grey-dark);
  border-radius: 5px;
  padding: 10px;
`;

const Label = styled.label`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  font-size: small;
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
  justify-content: center;
  align-items: center;
  gap: 10px;
`;

const Input = styled.input`
    border-radius: 5px;
    width: 200px;
`;

const Submit = styled.input`
    border-radius: 5px;    
`;

const Login = () => {
  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    onSubmit: (values) => {
      // TODO: Send values to backend
      console.log(values);

      
    },
  });
  /*
  axios.get("http://localhost:3001/login", {headers: values})
            .then(response => console.log(response.data))
            .catch(e => console.log(e));
  */

  return (
    <Wrapper>
      <Title>Welcome to EventCalendar</Title>
      <LoginHeading>Please login</LoginHeading>
      <Form id="login-form" onSubmit={formik.handleSubmit}>
        <Label>
          Username:
          <Input
            id="username"
            type="text"
            name="username"
            onChange={formik.handleChange}
            value={formik.values.username}
          />
        </Label>
        <Label>
          Password:
          <Input
            id="password"
            type="password"
            name="password"
            onChange={formik.handleChange}
            value={formik.values.password}
          />
        </Label>
        <Submit type="submit" value="Submit" id="login-submit" />
      </Form>
    </Wrapper>
  );
};

export default Login;
