export {};

const app = require("./app").app;

// Final Setup
const PORT = 3001;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = {
    app,
};
