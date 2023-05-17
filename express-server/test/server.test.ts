import { response } from "express";
import { EventType, UserType } from "../src/entities";
import exp from "constants";

let superTest = require("supertest");
let app = require("../src/express/server").app;
const axios = require("axios");
const authHeader = require("basic-auth-header");
const aws = require('aws-sdk');
const { pool } = require("../src/helpers").pool;

const username = "johndoe@email.com";
const pwd = "password123";
const headers = {
    Authorization: authHeader(username, pwd),
};

aws.config.update({
    accessKeyId: process.env.AWS_SECRET_KEY,
    secretAccessKey: process.env.AWS_ACCESS_KEY,
    region: 'ap-southeast-2'
  });

let request = superTest(app);

afterAll(() => {
    pool.end();
});

describe("Test authorization", () => {
    test("Test Normally", async () => {
        const user: UserType = {
            firstName: "Morty1",
            lastName: "Smith1",
            email: "morty.smith1@example.com",
            isAdmin: false,
            password: "123456",
        };

        await axios
            .post("http://localhost:3001/user", user, { headers: "BadAUTH" })
            .catch((err) => {
                // console.log("Status", response.status);
                expect(err.response.status).toBe(401);
            });
    });
});

describe("Test POST /event/:eventId/assign/:userId", () => {
    test("Test normally", async () => {
        /* Steps:
      1. Create a user
      2. Create an event
      3. Assign the event to the user
      4. Check that the event is assigned to the user
      5. Delete the event
      6. Delete the user
       */
        // 1. create user
        const user: UserType = {
            firstName: "Morty",
            lastName: "Smith",
            email: "morty.smith@example.com",
            isAdmin: false,
            password: "123456",
        };
        var userId;

        // 2. create event
        const event: EventType = {
            title: "Drinks on Andrew",
            location: "The Pub",
            startDate: new Date("2024-01-01T00:00:00.000Z"),
            endDate: new Date("2024-01-02T01:00:00.000Z"),
            description: "Bring your best fit",
        };
        var eventId;

        //ensure user is created
        await axios
            .post("http://localhost:3001/user", user, { headers: headers })
            .then((response) => {
                // console.log("Status", response.status);
                expect(response.status).toBe(200);
                userId = response.data.userId;
            });

        //ensure event is created
        await axios
            .post("http://localhost:3001/event", event, { headers: headers })
            .then((response) => {
                expect(response.status).toBe(201);
                eventId = response.data.eventId;
            });

        // 3. assign event to user.
        await axios
            .post(
                `http://localhost:3001/event/${eventId}/assign/${userId}`,
                {},
                { headers: headers }
            )
            .then((response) => {
                expect(response.status).toBe(201);
            });

        await axios
            .get(`http://localhost:3001/user/${userId}/events`, {
                headers: headers,
            })
            .then((response) => {
                expect(response.status).toBe(200);
                expect(response.data[0].eventId).toBe(eventId);
            });

        // 4. check that event is assigned to user
        // 5 & 6. delete user & event
        await axios
            .delete(`http://localhost:3001/event/${eventId}`, { headers })
            .then((response) => {
                expect(response.status).toBe(200);
            });

        await axios
            .delete(`http://localhost:3001/user/${userId}`, {
                headers: headers,
            })
            .then((response) => {
                expect(response.status).toBe(204);
            });
    });

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
        const startDateIN = new Date(new Date().setMilliseconds(0));
        const endDateIN = new Date(
            new Date(startDateIN.getTime() + 60 * 60 * 1000).setMilliseconds(0)
        ); // add 1 hour to startDate

        const event1: EventType = {
            title: "Company Picnic",
            location: "Central Park",
            startDate: startDateIN,
            endDate: endDateIN,
            description: "Annual company picnic for all employees.",
        };
        const event2: EventType = {
            title: "Sales Conference",
            location: "New York Marriott Marquis",
            startDate: startDateIN,
            endDate: endDateIN,
            description: "Sales conference for all regional managers.",
        };

        // console.log(event1.startDate)
        // console.log(event1.endDate)

        // console.log(event2.startDate)
        // console.log(event2.endDate)

        await axios
            .get(`http://localhost:3001/user/1/events`, { headers: headers })
            .then((response) => {
                //check valid
                expect(response.status).toBe(200);
                response.data[0].startDate = startDateIN.toISOString();
                response.data[1].startDate = startDateIN.toISOString();
                response.data[0].endDate = endDateIN.toISOString();
                response.data[1].endDate = endDateIN.toISOString();
                expect(response.data).toEqual([
                    {
                        ...event1,
                        eventId: 1,
                        startDate: startDateIN.toISOString(),
                        endDate: endDateIN.toISOString(),
                    },
                    {
                        ...event2,
                        eventId: 2,
                        startDate: startDateIN.toISOString(),
                        endDate: endDateIN.toISOString(),
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

    test("Test normally", async () => {
        // create user
        const user = {
            firstName: "Morty2",
            lastName: "Smith2",
            email: "morty@earth2.com",
            isAdmin: false,
            password: "123456",
        };

        const userResponse = await axios.post(
            "http://localhost:3001/user",
            user,
            {
                headers: headers,
            }
        );
        const userId = userResponse.data.userId;

        // setup events
        const startDate = new Date(new Date().setMilliseconds(0));
        const endDate = new Date(
            new Date(startDate.getTime() + 60 * 60 * 1000).setMilliseconds(0)
        ); // add 1 hour to startDate
        const event1: EventType = {
            title: "Test event 1",
            location: "test location 1",
            startDate: startDate,
            endDate: endDate,
            description: "test description 1",
        };
        const event2: EventType = {
            title: "Test event 2",
            location: "test location 2",
            startDate: startDate,
            endDate: endDate,
            description: "test description 2",
        };
        const event3: EventType = {
            title: "Test event 3",
            location: "test location 3",
            startDate: startDate,
            endDate: endDate,
            description: "test description 3",
        };

        let eventId1;
        let eventId2;
        let eventId3;

        // Create the test events
        await axios
            .post("http://localhost:3001/event", event1, { headers: headers })
            .then((response) => {
                expect(response.status).toBe(201);
                eventId1 = response.data.eventId;
            });

        await axios
            .post("http://localhost:3001/event", event2, { headers: headers })
            .then((response) => {
                expect(response.status).toBe(201);
                eventId2 = response.data.eventId;
            });

        await axios
            .post("http://localhost:3001/event", event3, { headers: headers })
            .then((response) => {
                expect(response.status).toBe(201);
                eventId3 = response.data.eventId;
            });

        // assign user to events
        await axios
            .post(
                `http://localhost:3001/event/${eventId2}/assign/${userId}`,
                {},
                { headers: headers }
            )
            .then((response) => {
                expect(response.status).toBe(201);
            });

        await axios
            .post(
                `http://localhost:3001/event/${eventId3}/assign/${userId}`,
                {},
                { headers: headers }
            )
            .then((response) => {
                expect(response.status).toBe(201);
            });

        await axios
            .get(`http://localhost:3001/user/${userId}/events`, {
                headers: headers,
            })
            .then((response) => {
                expect(response.status).toBe(200);
                expect(response.data[0]).toStrictEqual({
                    ...event2,
                    eventId: eventId2,
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                });
                expect(response.data[1]).toStrictEqual({
                    ...event3,
                    eventId: eventId3,
                    startDate: startDate.toISOString(),
                    endDate: endDate.toISOString(),
                });
            });

        // Delete the test events
        await axios
            .delete(`http://localhost:3001/event/${eventId1}`, { headers })
            .then((response) => {
                expect(response.status).toBe(200);
            });

        await axios
            .delete(`http://localhost:3001/event/${eventId2}`, { headers })
            .then((response) => {
                expect(response.status).toBe(200);
            });

        await axios
            .delete(`http://localhost:3001/event/${eventId3}`, { headers })
            .then((response) => {
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
