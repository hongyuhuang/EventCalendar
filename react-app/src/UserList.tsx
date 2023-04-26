import axios from "axios";
import React, { useEffect, useState } from "react";

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
}

function UserList() {
    const [users, setUsers] = useState<User[]>([]);
    
    const authHeader = (username: string, password: string) => {
        const base64Credentials = btoa(`${username}:${password}`);
        return `Basic ${base64Credentials}`;
    };

    const username = "johndoe@email.com";
    const password = "password123";

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
            <h2>User List</h2>
            <ul>
                {users.map((user) => (
                    <li key={user.id}>
                        {user.firstName} {user.lastName} - {user.email}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default UserList;
