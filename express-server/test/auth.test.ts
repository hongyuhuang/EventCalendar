const app = require("../src/express/app").app;
const request = require("supertest");
const agent = request.agent(app);
const authHeader = require("basic-auth-header");

const createAuthHeader = (username, password) => {
    return {
        Authorization: authHeader(username, password),
    };
};

const adminPassword = "password123";
const adminUsername = "johndoe@email.com";

let server;

beforeEach(() => {
    const testPort = 3002;

    server = app.listen(testPort, () => {
        console.log(`Server running on port ${testPort}`);
    });
});

afterEach(async () => {
    await server.close();
});

describe("Testing login route", () => {
    test("Test with admin user", async () => {
        expect.assertions(2);

        /*
        TODO:

        2. Login with the admin user
        3. Check if the response is 200
        4. Check if the request role is correct
         */

        const response = await agent
            .get("/login")
            .set(createAuthHeader(adminUsername, adminPassword))
            .send();

        expect(response.status).toBe(200);
        expect(response.body.isAdmin).toBe(true);
    });

    test("Test with a regular user", async () => {
        expect.assertions(4);

        /*
        Steps:
        
        Create a new user
        Login with the new user
        Check if the response is 200
        Check if the request role is correct
        
        Delete user
         */

        const newUser = {
            email: "test@example.com",
            password: "password123",
            isAdmin: false,
            firstName: "test",
            lastName: "user",
        };

        let userId = null;

        try {
            const createResponse = await agent
                .post("/user")
                .set(createAuthHeader(adminUsername, adminPassword))
                .send(newUser);

            expect(createResponse.status).toBe(200);

            userId = createResponse.body.userId;

            const loginResponse = await agent
                .get("/login")
                .set(createAuthHeader(newUser.email, newUser.password))
                .send();

            expect(loginResponse.status).toBe(200);
            expect(loginResponse.body.isAdmin).toBe(false);
        } finally {
            const deleteResponse = await agent
                .delete(`/user/${userId}`)
                .set(createAuthHeader(adminUsername, adminPassword))
                .send({ email: newUser.email });

            expect(deleteResponse.status).toBe(204);
        }
    });
});
