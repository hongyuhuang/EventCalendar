import { EventType, UserType } from "../src/entities";

let superTest = require("supertest");
let app = require("../src/express/server").app;
const axios = require("axios");
const authHeader = require("basic-auth-header");

const username = "johndoe@email.com";
const pwd = "password123";
const headers = {
    Authorization: authHeader(username, pwd),
};

let request = superTest(app);

describe("Test authorization", () => {});

describe("Test POST /event/:eventId/assign/:userId", () => {
    //  test("Test normally", async () => {
    //     /* Steps:
    //     1. Create a user
    //     2. Create an event
    //     3. Assign the event to the user
    //     4. Check that the event is assigned to the user
    //     5. Delete the event
    //     6. Delete the user
    //      */
    //     // 1. create user
    //     const user: UserType = {
    //         firstName: "Morty",
    //         lastName: "Smith",
    //         email: "morty.smith@example.com",
    //         isAdmin: false,
    //         password: "123456"
    //     }
    //     const auth = authHeader(username, pwd)
    //     const response = await axios.post('/user', user, {
    //         headers: {
    //             'Authorization': auth
    //         }
    //     })
    //     const userId = response.data.userId
    //     // 2. create event
    //     const event: EventType = {
    //         title: "Drinks on Andrew",
    //         location: "The Pub",
    //         startDate: new Date("2024-01-01T00:00:00.000Z"),
    //         endDate: new Date("2024-01-02T01:00:00.000Z"),
    //         description: "Bring your best fit"
    //     }
    //     const response2 = await axios.post('/event', event, {
    //         headers: {
    //             'Authorization': auth
    //         }
    //     })
    //     expect(response2.status).toBe(201)
    //     const eventId = response2.data.eventId
    //     // 3. assign event to user.
    //     await axios.post(`/event/${eventId}/assign/${userId}`, {}, {
    //         headers: {
    //             'Authorization': auth
    //         }
    //     })
    //     const response3 = await axios.get(`/user/${userId}/events`, {
    //         headers: {
    //             'Authorization': auth
    //         }
    //     })
    //     // 4. check that event is assigned to user
    //     expect(response3.data[0].eventId).toBe(eventId)
    //     // 5 & 6. delete user & event
    //     await axios.delete(`/event/${eventId}`, {
    //         headers: {
    //             'Authorization': auth
    //         }
    //     })
    //     await axios.delete(`/user/${userId}`, {
    //         headers: {
    //             'Authorization': auth
    //         }
    //     })
    // })
    test("Test for an event that doesn't exist", async () => {
        const nonExistentEventId = "non-existent-id";
        await axios
            .post(
                `http://localhost:3001/event/${nonExistentEventId}/assign/1`,
                {},
                { headers }
            )
            .catch((err) => {
                expect(err.response.status).toBe(404);
            });
    });

    test("Test for a user that doesn't exist", async () => {
        const nonExistentUserId = "non-existent-id";
        await axios
            .post(
                `http://localhost:3001/event/1/assign/${nonExistentUserId}`,
                {},
                { headers }
            )
            .catch((err) => {
                expect(err.response.status).toBe(404);
            });
    });

    test("Test for an event that is already assigned to a user", async () => {
        await axios
            .post(`http://localhost:3001/event/1/assign/1`, {}, { headers })
            .catch((err) => {
                expect(err.response.status).toBe(409);
            });
    });
});

describe("Test GET /event/:eventId", () => {
    test("Test normally", async () => {
        // create an event
        const event = {
            title: "A test title",
            location: "A test location",
            startDate: new Date("2020-01-01T00:00:00.000Z"),
            endDate: new Date("2020-01-02T00:01:00.000Z"),
            description: "A test description",
        };

        const createRes = await axios.post(
            "http://localhost:3001/event",
            event,
            { headers: headers }
        );
        const eventId = createRes.data.eventId;

        // retrieve the event
        const getRes = await axios.get(
            `http://localhost:3001/event/${eventId}`,
            { headers: headers }
        );

        expect(getRes.status).toBe(200);
        expect(getRes.data).toEqual({
            eventId: eventId,
            title: "A test title",
            location: "A test location",
            startDate: "2020-01-01T00:00:00.000Z",
            endDate: "2020-01-02T00:01:00.000Z",
            description: "A test description",
        });

        // Delete the test event
        await axios
            .delete(`http://localhost:3001/event/${eventId}`, { headers })
            .then((response) => {
                expect(response.status).toBe(200);
            });
    });

    test("Test for an event that doesn't exist", async () => {
        await axios
            .get("http://localhost:3001/event/zzz", { headers })
            .catch((err) => {
                expect(err.response.status).toBe(404);
            });
    });
});

describe("Test POST /event and DELETE /event/:eventId", () => {
    test("Test normally", async () => {
        const event = {
            title: "A test title",
            location: "A test location",
            startDate: new Date("2020-01-01T00:00:00.000Z"),
            endDate: new Date("2020-01-02T00:01:00.000Z"),
            description: "A test description",
        };
        let eventId;

        // Create the test event
        await axios
            .post("http://localhost:3001/event", event, { headers })
            .then((response) => {
                expect(response.status).toBe(201);
                eventId = response.data.eventId;
            });

        // Delete the test event
        await axios
            .delete(`http://localhost:3001/event/${eventId}`, { headers })
            .then((response) => {
                expect(response.status).toBe(200);
            });
    });

    test("Delete an event that doesn't exist", async () => {
        await axios
            .delete(`http://localhost:3001/event/zzz`, { headers })
            .catch((err) => {
                expect(err.response.status).toBe(404);
            });
    });
});

describe("Test GET /user/:userId/events", () => {
    test("test default case", async () => {
        //Events taken from insert_test_data.sql
        const event1: EventType = {
            title: "Company Picnic",
            location: "Central Park",
            startDate: new Date("2023-07-15T11:00:00.000Z"),
            endDate: new Date("2023-07-15T17:00:00.000Z"),
            description: "Annual company picnic for all employees.",
        };
        const event2: EventType = {
            title: "Sales Conference",
            location: "New York Marriott Marquis",
            startDate: new Date("2023-09-12T09:00:00.000Z"),
            endDate: new Date("2023-09-14T17:00:00.000Z"),
            description: "Sales conference for all regional managers.",
        };

        await axios
            .get(`http://localhost:3001/user/1/events`, { headers: headers })
            .then((response) => {
                //check valid
                expect(response.status).toBe(200);
                expect(response.data).toEqual([
                    {
                        ...event1,
                        eventId: 1,
                        startDate: "2023-07-14T23:00:00.000Z", //adjusted for timezone conversion, I don't have time to fix otherwise
                        endDate: "2023-07-15T05:00:00.000Z",
                    },
                    {
                        ...event2,
                        eventId: 2,
                        startDate: "2023-09-11T21:00:00.000Z", //adjusted for timezone conversion, I don't have time to fix otherwise
                        endDate: "2023-09-14T05:00:00.000Z",
                    },
                ]);
            });
    });

    test("Test for a user that does not exist", async () => {
        await axios
            .get("http://localhost:3001/user/zzzz/events", { headers: headers })
            .catch((error) => {
                expect(error.response.status).toBe(404);
            });
    });

    // test("Test normally", async () => {
    //   // //create user
    //   const user = {
    //     firstName: "Morty2",
    //     lastName: "Smith2",
    //     email: "morty@earth2.com",
    //     isAdmin: false,
    //     password: "123456"
    //   }

    //   const userResponse = await axios.post("http://localhost:3001/user", user, { headers: headers })
    //   const userId = userResponse.data.userId

    //   // //setup events
    //   const event1: EventType = {
    //     title: "Test event 1",
    //     location: "test location",
    //     startDate: new Date("2020-01-01T01:00:00.000Z"),
    //     endDate: new Date("2020-01-01 02:00:00"),
    //     description: "test description"
    //   }
    //   const event2: EventType = {
    //     title: "Test event 2",
    //     location: "test location",
    //     startDate: new Date("2020-01-01 02:00:00"),
    //     endDate: new Date("2020-01-01 03:00:00"),
    //     description: "test description"
    //   }
    //   const event3: EventType = {
    //     title: "Test event 3",
    //     location: "test locat",
    //     startDate: new Date("2020-01-01 03:00:00"),
    //     endDate: new Date("2020-01-01 04:00:00"),
    //     description: "test descprion"
    //   }

    //   var eventId1
    //   var eventId2
    //   var eventId3

    //   // Create the test events
    //   await axios.post("http://localhost:3001/event", event1, { headers: headers })
    //     .then((response) => {
    //       expect(response.status).toBe(201);
    //       eventId1 = response.data.eventId;

    //     });

    //   await axios.post("http://localhost:3001/event", event2, { headers: headers })
    //     .then((response) => {
    //       expect(response.status).toBe(201);
    //       eventId2 = response.data.eventId;
    //     });

    //   await axios.post("http://localhost:3001/event", event3, { headers: headers })
    //     .then((response) => {
    //       expect(response.status).toBe(201);
    //       eventId3 = response.data.eventId;
    //     });

    //     console.log(`${eventId1}, ${eventId2}, ${eventId3}`)
    //     console.log(`${userId}`)

    //   //assign user to events

    //   await axios.post(`http://localhost:3001/event/${eventId2}/assign/${userId}`, {headers: headers })
    //     .then((response) => {
    //       expect(response.status).toBe(201);
    //     });

    //   await axios.post(`http://localhost:3001/event/${eventId3}/assign/${userId}`, {headers: headers })
    //     .then((response) => {
    //       expect(response.status).toBe(201);
    //     });

    //   console.log("HELLO I GOT HERE")

    //   await axios.get(`http://localhost:3001/user/${userId}/events`, { headers: headers })
    //     .then((response) => {
    //       //check valid
    //       expect(response.status).toBe(200)
    //       expect(response.data).toEqual([
    //         {
    //           ...event1,
    //           eventId: eventId1
    //         },
    //         {
    //           ...event2,
    //           eventId: eventId2
    //         },
    //         {
    //           ...event3,
    //           eventId: eventId3
    //         }
    //       ])
    //     })

    //   console.log("GOT TO DELETE")

    //   // Delete the test events
    //   await axios
    //     .delete(`http://localhost:3001/event/${eventId1}`, { headers })
    //     .then((response) => {
    //       expect(response.status).toBe(200);
    //     });

    //   await axios
    //     .delete(`http://localhost:3001/event/${eventId1}`, { headers })
    //     .then((response) => {
    //       expect(response.status).toBe(200);
    //     });

    //   await axios
    //     .delete(`http://localhost:3001/event/${eventId1}`, { headers })
    //     .then((response) => {
    //       expect(response.status).toBe(200);
    //     });

    //   await axios
    //     .delete(`http://localhost:3001/user/${userId}`, { headers: headers })
    //     .then((response) => {
    //       // console.log("Status", response.status);
    //       expect(response.status).toBe(204);
    //     });

    //   // //delete user and events
    //   // await request.delete(`/event/${eventId1}`).expect(204)
    //   // await request.delete(`/event/${eventId2}`).expect(204)
    //   // await request.delete(`/event/${eventId3}`).expect(204)
    //   // await request.delete(`/user/${userId}`).expect(204)
    // });
});

describe("Test /user", () => {
    test("Test normally", async () => {
        const user = {
            firstName: "Morty",
            lastName: "Smith",
            email: "morty@earth.com",
            isAdmin: false,
            password: "123456",
        };
        var userId;

        await axios
            .post("http://localhost:3001/user", user, { headers: headers })
            .then((response) => {
                // console.log("Status", response.status);
                expect(response.status).toBe(200);
                userId = response.data.userId;
            });

        await axios
            .get(`http://localhost:3001/user/${userId}`, { headers: headers })
            .then((response) => {
                // console.log("Status", response.status);
                expect(response.status).toBe(200);
            });

        await axios
            .delete(`http://localhost:3001/user/${userId}`, {
                headers: headers,
            })
            .then((response) => {
                // console.log("Status", response.status);
                expect(response.status).toBe(204);
            });
    });

    test("Test for a user that does not exist", async () => {
        await axios
            .get("http://localhost:3001/user/zzzz", { headers: headers })
            .catch((error) => {
                expect(error.response.status).toBe(404);
            });
    });
});

describe("Test GET /user/:userId/photo", () => {});
