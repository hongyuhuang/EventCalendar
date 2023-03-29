import React from 'react';
import {useFormik} from "formik";

const Login = () => {
    const formik = useFormik({
        initialValues: {
            username: '',
            password: ''
        }, onSubmit: values => {
            // TODO: Send values to backend
            console.log(values)
        }
    })

    return (
        <div id="login-div">
            <h1>Welcome to EventCalendar</h1>
            <h2>Please login</h2>
            <form id="login-form" onSubmit={formik.handleSubmit}>
                <label className="login-label">
                    Username:
                    <input id="username" type="text" name="username" onChange={formik.handleChange} value={formik.values.username}/>
                </label>
                <label className="login-label">
                    Password:
                    <input id="password" type="password" name="password" onChange={formik.handleChange}
                           value={formik.values.password}/>
                </label>
                <input type="submit" value="Submit" id="login-submit"/>
            </form>
        </div>
    );
}

export default Login