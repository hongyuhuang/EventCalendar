import axios from "axios";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { User } from "./types";


const Wrapper = styled.div`
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    padding: 16px;
    width: 960px;
`;

const Table = styled.table`
    border-collapse: collapse;
    width: 100%;
    margin-top: 20px;

    th,
    td {
        text-align: left;
        padding: 8px;
    }

    tr:nth-child(even) {
        background-color: #f2f2f2;
    }
`;

const Heading = styled.h2`
    color: var(--otago-blue-dark);
`;

const TrashIcon = styled(FontAwesomeIcon)`
    margin-right: 8px;
`;

const IconWrapper = styled.div`
    display: flex;
    align-items: center;

    &:hover ${TrashIcon} {
        color: red;
        cursor: pointer;
    }
`;

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
        <Wrapper>
            <Heading>List of Users</Heading>
            <Table>
                <thead>
                    <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Email</th>
                        <th>Number of Events</th>
                        <th></th>
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
                                    <IconWrapper>
                                        <TrashIcon icon={faTrashAlt} onClick={() => handleDeleteUser(user.userId)} />
                                    </IconWrapper>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        </Wrapper>
    );
}

export default UserList;
