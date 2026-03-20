const express = require("express");
const path = require("path");
const routes = require("./routes");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use("/api", routes);

const startServer = (musicPath) => {
    app.locals.musicPath = musicPath;
    
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on port ${PORT}`);
    });
};

module.exports = { startServer };