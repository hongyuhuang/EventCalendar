import axios from "axios";
import React, { useEffect, useState } from "react";
import styled from "styled-components";

const Table = styled.table`
    border-collapse: collapse;
    width: 100%;
    margin-top: 20px;

    th,
    td {
        text-align: left;
        padding: 8px;
    }

    th {
        background-color: #f2f2f2;
    }

    tr:nth-child(even) {
        background-color: #f2f2f2;
    }
`;

const Heading = styled.h2`
  color: var(--otago-blue-dark);
`;

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
}

function  UserList({ username, password }: { username: string; password: string }) {
    const [users, setUsers] = useState<User[]>([]);

    const authHeader = (username: string, password: string) => {
        const base64Credentials = btoa(`${username}:${password}`);
        return `Basic ${base64Credentials}`;
    };

    const headers = {
        Authorization: authHeader(username, password),
    };

    useEffect(() => {
        axios
            .get("http://localhost:3001/user", { headers: headers })
            .then((response) => {
                setUsers(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
    }, []);

    return (
        <div>
            <Heading>List of Users</Heading>
            <Table>
                <thead>
                    <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>{user.firstName}</td>
                            <td>{user.lastName}</td>
                            <td>{user.email}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
}

export default UserList;
