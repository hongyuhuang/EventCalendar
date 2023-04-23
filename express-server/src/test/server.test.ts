import {EventType, UserType} from "../entities";

let superTest = require('supertest');
let app = require('../server').app;

let request = superTest(app);

describe("Test authorization", () => {
})

describe('Test POST /event/:eventId/assign/:userId', () => {

    test("Test normally", async () => {
        /* Steps:
        1. Create a user
        2. Create an event
        3. Assign the event to the user
        4. Check that the event is assigned to the user
        5. Delete the event
        6. Delete the user
         */

        const user: UserType = {
            firstName: "Morty",
            lastName: "Smith",
            email: "morty.smith@example.com",
            isAdmin: false,
            password: "123456"
        }

        const response = await request.post('/user').send(user)

        const userId = response.body.userId

        const event: EventType = {
            location: "",
            startDate: new Date( "2020-01-01 00:00:00"),
            title: "",
            description: "",
            endDate: new Date("2020-01-01 00:00:00")
        }


        const response2 = await request.post('/event').send(event)
        expect(response2.status).toBe(201)

        const eventId = response2.body.eventId

        await request.post(`/event/${eventId}/assign/${userId}`).expect(201 )

        const response3 = await request.get(`/user/${userId}/events`).expect(200)

        expect(response3.body[0].eventId).toBe(eventId)

        await request.delete(`/event/${eventId}`).expect(204)
        await request.delete(`/user/${userId}`).expect(204)
    })

    test("Test for an event that doesn't exist", () => {
    })

    test("Test for a user that doesn't exist", () => {
    })

    test("Test for an event that is already assigned to a user", () => {
    })
})

describe('Test GET /event/:eventId', () => {

    test("Test normally", () => {
    })

    test("Test for an event that doesn't exist", () => {
    })
})

describe('Test POST /event', () => {

    test("Test normally", async () => {

        const event = {
            title: "A test title",
            location: "A test location",
            startDate: "2020-01-01 00:00:00",
            endDate: "2020-01-01 00:01:00",
            description: "A test description"
        }

        const response = request.post('/event').send(event).expect(200)

        const eventId = response.body.eventId

        const response2 = request.get(`/event/${eventId}`).expect(200)

        expect(response2.body.eventId).toBeTruthy()

        request.delete(`/event/${eventId}`).expect(204)
    })
})

describe("Test DELETE /event/:eventId", () => {

    test("Test normally", () => {

        const event = {
            title: "A test title",
            location: "A test location",
            startDate: "2020-01-01 00:00:00",
            endDate: "2020-01-01 00:01:00",
            description: "A test description"
        }

        const response = request.post('/event').send(event).expect(200)

        const eventId = response.body.eventId

        request.delete(`/event/${eventId}`).expect(204)

        request.get(`/event/${eventId}`).expect(404)

    })

    test("Test for an event that doesn't exist", () => {
        request.delete('/event/123').expect(404)
    })
})

describe('Test GET /user/:userId/events', () => {

    test("Test normally", () => {
        const user = {
            firstName: "Morty",
            lastName: "Smith",
            email: "morty@earth.com",
            isAdmin: false,
            password: "123456"
        }

        const response = request.post('/user').send(user).expect(200)

        const userId = response.body.userId

        const event1: EventType = {
            description: "",
            endDate:  new Date("2020-01-01 00:00:00"),
            location: "",
            startDate:  new Date("2020-01-01 00:00:00"),
            title: "Test event 1"
        }

        const event2: EventType = {
            description: "",
            endDate:  new Date("2020-01-01 00:00:00"),
            location: "",
            startDate:  new Date("2020-01-01 00:00:00"),
            title: "Test event 2"
        }

        const event3: EventType = {
            description: "",
            endDate: new Date("2020-01-01 00:00:00"),
            location: "",
            startDate:  new Date("2020-01-01 00:00:00"),
            title: "Test event 3",
        }

        const response2 = request.post('/event').send(event1).expect(200)
        const response3 = request.post('/event').send(event2).expect(200)
        const response4 = request.post('/event').send(event3).expect(200)

        const eventId1 = response2.body.eventId
        const eventId2 = response3.body.eventId
        const eventId3 = response4.body.eventId

        request.post(`/event/${eventId1}/assign/${userId}`).expect(204)
        request.post(`/event/${eventId2}/assign/${userId}`).expect(204)
        request.post(`/event/${eventId3}/assign/${userId}`).expect(204)

        const response5 = request.get(`/user/${userId}/events`).expect(200)

        expect(response5.body).toEqual([event1, event2, event3])

        request.delete(`/event/${eventId1}`).expect(204)
        request.delete(`/event/${eventId2}`).expect(204)
        request.delete(`/event/${eventId3}`).expect(204)

        request.delete(`/user/${userId}`).expect(204)
    })

    test("Test for a user that does not exist", () => {
    })
})

describe("Test GET /user", () => {

    test("Test normally", async () => {
        const user = {
            firstName: "Morty",
            lastName: "Smith",
            email: "morty@earth.com",
            isAdmin: false,
            password: "123456"
        }

        const response = await request.post('/user').send(user)
        expect(response.status).toBe(201)

        const userId = response.body.userId

        const response2 = await request.get(`/user/${userId}`)
        expect(response2.status).toBe(200)
        expect(response2.body).toMatchObject({firstName: user.firstName, lastName: user.lastName, userId: userId})

    })

    test("Test for a user that does not exist", async () => {
        await request.get('/user/123').expect(404)
    })
})

describe('Test GET /user/:userId/photo', () => {
})
