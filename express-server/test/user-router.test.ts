const { checkUserIdMatchesUsername } = require("../src/express/user-router.ts");

const helpers = require("../src/helpers");

describe("Testing user Id matches username", () => {
    afterAll(() => {
        const pool = helpers.pool;
        pool.end(); // Stops tests going on forever
    });

    test("user id matches username", async () => {
        expect.assertions(1);

        const adminId = 1;
        const adminUsername = "johndoe@email.com";

        const matches = await checkUserIdMatchesUsername(
            adminId,
            adminUsername
        );
        expect(matches).toBeTruthy();
    });

    test("Test for non match", async () => {
        expect.assertions(1);

        const adminId = 1;
        const adminUserName = "notjohndoe";

        const matches = await checkUserIdMatchesUsername(
            adminId,
            adminUserName
        );
        expect(matches).toBeFalsy();
    });
});

describe("Test dealing with photos", () => {
    describe("Test posting photos", () => {});

    describe("Test getting photos", () => {});
});
