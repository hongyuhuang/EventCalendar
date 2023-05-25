import axios from "axios";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import { User } from "./types";
import { useNavigate } from "react-router-dom";

// Wrapper for the entire page
const Wrapper = styled.div`
    // Styling for the wrapper
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    padding: 16px;
    width: 960px;
`;

// Table for the user list
const Table = styled.table`
    // Styling for the table
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

// Heading for the page
const Heading = styled.h2`
    // Styling for the heading
    color: var(--otago-blue-dark);
`;

// Trash icon
const TrashIcon = styled(FontAwesomeIcon)`
    margin-right: 8px;
`;

// Edit icon
const EditIcon = styled(FontAwesomeIcon)`
    margin-right: 8px;
`;

// Wrapper for the icon
const IconWrapper = styled.div`
    display: flex;
    align-items: center;

    &:hover ${TrashIcon} {
        color: red;
        cursor: pointer;
    }
`;

function UserList() {
    const [users, setUsers] = useState<User[]>([]);
    const [eventCounts, setEventCounts] = useState<{
        [userId: number]: number;
    }>({});

    const userData = sessionStorage.getItem("userData");
    const password = sessionStorage.getItem("password") || "";

    let username = "";
    if (userData) {
        const user: User = JSON.parse(userData);
        username = user.email;
    }
    const authHeader = (username: string, password: string) => {
        const base64Credentials = btoa(`${username}:${password}`);
        return `Basic ${base64Credentials}`;
    };

    const headers = {
        Authorization: authHeader(username, password),
    };

    useEffect(() => {
        axios
            .get("/user", { headers: headers }) // Fetching user data
            .then((response) => {
                setUsers(response.data); // Update users state with fetched data
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
                    try {
                        const response = await axios.get(
                            `/user/${user.userId}/events`, // Fetching events for each user
                            { headers: headers }
                        );
                        const events = response.data;
                        counts[user.userId] = events.length; // Storing the number of events for each user
                    } catch (error) {
                        console.log(error);
                    }
                }
                setEventCounts(counts); // Update eventCounts state with the fetched event counts
            } catch (error) {
                console.log(error);
            }
        };

        fetchEventCounts();
    }, [users]);

    const navigate = useNavigate();

    const handleEditUser = (user: User) => {
        navigate("/edit-user", { state: { user: user } }); // Navigate to the edit user page with the selected user data
    };

    const handleDeleteUser = (userId: number) => {
        axios
            .delete(`/user/${userId}`, {
                headers: headers,
            }) // Delete user by user ID
            .then(() => {
                setUsers(
                    (prevUsers) =>
                        prevUsers.filter((user) => user.userId !== userId) // Update the users state by removing the deleted user
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
                        <th>Edit</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => {
                        return (
                            <tr key={user.userId}>
                                <td>{user.firstName}</td>
                                <td>{user.lastName}</td>
                                <td>{user.email}</td>
                                <td>{eventCounts[user.userId]}</td>

                                <td>
                                    <IconWrapper>
                                        <EditIcon
                                            icon={faEdit}
                                            onClick={() => handleEditUser(user)} // Trigger handleEditUser function on icon click
                                        />
                                    </IconWrapper>
                                </td>

                                <td>
                                    <IconWrapper>
                                        <TrashIcon
                                            icon={faTrashAlt}
                                            onClick={
                                                () =>
                                                    handleDeleteUser(
                                                        user.userId
                                                    ) // Trigger handleDeleteUser function on icon click
                                            }
                                        />
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
