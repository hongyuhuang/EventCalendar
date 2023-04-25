import { EventType, UserType } from "../src/entities";

let superTest = require("supertest");
let app = require("../src/server").app;
const axios = require("axios");
const authHeader = require("basic-auth-header");

const username = "johndoe@email.com";
const pwd = "password123";

let request = superTest(app);

describe("Test authorization", () => {});

describe("Test POST /event/:eventId/assign/:userId", () => {
    // test("Test normally", async () => {
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
    // test("Test for an event that doesn't exist", () => {
    // })
    // test("Test for a user that doesn't exist", async () => {
    //     //setup an event
    //     const event: EventType = {
    //         title: "Drinks on Andrew",
    //         location: "The Pub",
    //         startDate: new Date("2024-01-01T00:00:00.000Z"),
    //         endDate: new Date("2024-01-02T01:00:00.000Z"),
    //         description: "Bring your best fit"
    //     }
    //     //ensure event is made and valid.
    //     const response = await request.post('/event').send(event)
    //     expect(response.status).toBe(201)
    //     const eventId = response.body.eventId
    //     const response2 = await request.post(`/event/${eventId}/assign/xyz`).expect(500)
    //     console.log(response2)
    // })
    // test("Test for an event that is already assigned to a user", () => {
    // })
});

describe("Test GET /event/:eventId", () => {
    test("Test normally", () => {});

    test("Test for an event that doesn't exist", () => {});
});

describe("Test POST /event", () => {
    // test("Test normally", async () => {
    //     const event = {
    //         title: "A test title",
    //         location: "A test location",
    //         startDate: new Date("2020-01-01T00:00:00.000Z"),
    //         endDate: new Date("2020-01-02T00:01:00.000Z"),
    //         description: "A test description"
    //     }
    //     const response = await request.post('/event').send(event).expect(201)
    //     const eventId = response.body.eventId
    //     const response2 = await request.get(`/event/${eventId}`).expect(200)
    //     expect(response2.body.eventId).toBeTruthy()
    //     request.delete(`/event/${eventId}`).expect(204)
    // })
});

// note this assumes that the post works.
describe("Test DELETE /event/:eventId", () => {
    // test("Test normally", async () => {
    //     const event = {
    //         title: "A test title",
    //         location: "A test location",
    //         startDate: "2020-01-01 00:00:00",
    //         endDate: "2020-01-01 00:01:00",
    //         description: "A test description"
    //     }
    //     const response = await request.post('/event').send(event).expect(201)
    //     const eventId = response.body.eventId
    //     request.delete(`/event/${eventId}`).expect(204)
    //     request.get(`/event/${eventId}`).expect(404)
    // })
    // test("Test for an event that doesn't exist", () => {
    //     request.delete('/event/123').expect(404)
    // })
});

describe("Test GET /user/:userId/events", () => {
    test("Test normally", async () => {
        //COMMENTING OUT FOR NOW, DATES ARE JUST BEING WEIRD, NEED TO TALK TO DANIEL
        // TODO: Fix
        // //create user
        // const user = {
        //   firstName: "Morty",
        //   lastName: "Smith",
        //   email: "morty@earth.com",
        //   isAdmin: false,
        //   password: "123456"
        // }
        // const response = await request.post('/user').send(user).expect(201)
        // const userId = response.body.userId
        // //setup events
        // const event1: EventType = {
        //     title: "Test event 1",
        //     location: "test location",
        //     startDate:  new Date("2020-01-01T01:00:00.000Z"),
        //     endDate:  new Date("2020-01-01 02:00:00"),
        //     description: "test description"
        // }
        // const event2: EventType = {
        //     title: "Test event 2",
        //     location: "test location",
        //     startDate:  new Date("2020-01-01 01:00:00"),
        //     endDate:  new Date("2020-01-01 02:00:00"),
        //     description: "test description"
        // }
        // const event3: EventType = {
        //     title: "Test event 3",
        //     location: "test locat",
        //     startDate:  new Date("2020-01-01 01:00:00"),
        //     endDate: new Date("2020-01-01 02:00:00"),
        //     description: "test descprion"
        // }
        // //create events
        // const response2 = await request.post('/event').send(event1).expect(201)
        // const response3 = await request.post('/event').send(event2).expect(201)
        // const response4 = await request.post('/event').send(event3).expect(201)
        // const eventId1 = response2.body.eventId
        // const eventId2 = response3.body.eventId
        // const eventId3 = response4.body.eventId
        // //assign user to events
        // await request.post(`/event/${eventId1}/assign/${userId}`).expect(201)
        // await request.post(`/event/${eventId2}/assign/${userId}`).expect(201)
        // await request.post(`/event/${eventId3}/assign/${userId}`).expect(201)
        // const response5 = await request.get(`/user/${userId}/events`).expect(200)
        // console.log("RESPONSE BODY FOR C"  + response5.body)
        // //check valid
        // expect(response5.body).toEqual([
        //   {
        //     ...event1,
        //     eventId: eventId1,
        //     startDate: "2020-01-01T00:01:00.000Z",
        //     endDate: "2020-01-01T00:02:00.000Z"
        //   },
        //   {
        //     ...event2,
        //     eventId: eventId2,
        //     startDate: "2020-01-01T00:01:00.000Z",
        //     endDate: "2020-01-01T00:02:00.000Z"
        //   },
        //   {
        //     ...event3,
        //     eventId: eventId3,
        //     startDate: "2020-01-01T00:01:00.000Z",
        //     endDate: "2020-01-01T00:02:00.000Z"
        //   }
        // ])
        // //delete user and events
        // await request.delete(`/event/${eventId1}`).expect(204)
        // await request.delete(`/event/${eventId2}`).expect(204)
        // await request.delete(`/event/${eventId3}`).expect(204)
        // await request.delete(`/user/${userId}`).expect(204)
    });

    test("Test for a user that does not exist", () => {});
});

describe("Test GET /user", () => {
    test("Test normally", async () => {
        const user = {
            firstName: "Morty",
            lastName: "Smith",
            email: "morty@earth.com",
            isAdmin: false,
            password: "123456",
        };

        var userId;
        const username = "johndoe@email.com";
        const pwd = "password123";

        const headers = {
            Authorization: authHeader(username, pwd),
        };

        /*
         * With testing jest async, if you are using .then you need to return the promise from the test.
         * For normal async/await - declare test async, then await the promise, and do your assertions from there.
         *
         * Described here https://jestjs.io/docs/asynchronous
         *
         * I'd recommend using SuperTest, as it bounds your app to a particular port, and has built inserts for then (if this is want to use)
         * (You,d still need to return promises as described in jest docs). I think it also looks cleaner with await - my preference.
         *
         * e.g. (using request as defined at start of file).
         *
         * const response = await request.get("/user").set(headers);
         * expect(response.status).toBe(200);
         * console.log(response.body);
         *
         * One last point I should've told you earlier,  I've switched the ports for express and react. React uses port 3000, and express uses 3001.
         * This is defined in the server.ts I copied in - no need to use .env
         *
         * For code below:
         *
         * Axios.post(), requires a body to be passed in, and headers after this
         *
         * Previous code was intepretting {headers : headers} as the body, and not the headers, this is why auth was failing, no headers were actually being sent.
         *
         * Old version:
         *
         * return axios
            .post("http://localhost:3001/user", { headers: headers })
            .then((response) => {
                // console.log('Response', response.data);
                console.log("Status", response.status);
                expect(response.status).toBe(200);
                userId = response.body.userId;
                console.log(response.body);
            });
            *
            * New and improved
            *
            return axios
            .post("http://localhost:3001/user", {a user to post}, { headers: headers })
            .then((response) => {
                // console.log('Response', response.data);
                console.log("Status", response.status);
                expect(response.status).toBe(200);
                userId = response.body.userId;
                console.log(response.body);
            });

         */
        return axios
            .post("http://localhost:3001/user", {}, { headers: headers })
            .then((response) => {
                // console.log('Response', response.data);
                console.log("Status", response.status);
                expect(response.status).toBe(200);
                userId = response.body.userId;
                console.log(response.body);
            });

        /*

        await axios
            .get(`http://localhost:3000/user/${userId}`, { headers: headers })
            .then((response) => {
                console.log("Status", response.status);
                expect(response.status).toBe(200);
            });

        await axios
            .delete(`http://localhost:3000/user/${userId}`, {
                headers: headers,
            })
            .then((response) => {
                console.log("Status", response.status);
                expect(response.status).toBe(204);
            });

         */
    });

    // test("Test for a user that does not exist", async () => {
    //     await request.get('/user/zzzz').expect(404)
    // })
});

describe("Test GET /user/:userId/photo", () => {});
