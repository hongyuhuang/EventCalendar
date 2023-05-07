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
    userId: number;
    isAdmin: number;
    firstName: string;
    lastName: string;
    email: string;
}

function UserList({
    username,
    password,
}: {
    username: string;
    password: string;
}) {
    const [users, setUsers] = useState<User[]>([]);
    const [eventCounts, setEventCounts] = useState<{
        [userId: number]: number;
    }>({});

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

    useEffect(() => {
        const fetchEventCounts = async () => {
            try {
                const counts: { [userId: number]: number } = {};
                for (const user of users) {
                    console.log("User ID:", user.userId);
                    try {
                        const response = await axios.get(
                            `http://localhost:3001/${user.userId}/events`,
                            { headers }
                        );
                        const events = response.data;
                        console.log("Assigned Events:", events.length);
                        counts[user.userId] = events.length;
                    } catch (error) {
                        if ((error as any).response &&(error as any).response.status === 404) {
                            counts[user.userId] = 0; // Set event count to 0 for the user
                        } else {
                            console.log(
                                "Error fetching events for user ID:",
                                user.userId
                            );
                            console.log(error);
                        }
                    }
                }
                setEventCounts(counts);
            } catch (error) {
                console.log(error);
            }
        };

        fetchEventCounts();
    }, [users]);

    const handleDeleteUser = (userId: number) => {
        axios
            .delete(`http://localhost:3001/user/${userId}`, {
                headers: headers,
            })
            .then(() => {
                setUsers((prevUsers) =>
                    prevUsers.filter((user) => user.userId !== userId)
                );
            })
            .catch((error) => {
                console.log(error);
            });
    };

    return (
        <div>
            <Heading>List of Users</Heading>
            <Table>
                <thead>
                    <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                        <th>Number of Events</th> {/* Added column header */}
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => {
                        console.log("User ID:", user.userId);
                        return (
                            <tr key={user.userId}>
                                <td>{user.firstName}</td>
                                <td>{user.lastName}</td>
                                <td>{user.email}</td>
                                <td>{eventCounts[user.userId]}</td>
                                <td>
                                    <button
                                        onClick={() =>
                                            handleDeleteUser(user.userId)
                                        }
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        </div>
    );
}

export default UserList;
