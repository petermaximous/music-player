const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const routes = require("./routes");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    }
});

const PORT = 3000;

let playerState = {
    currentIndex: 0,
    isPlaying: false,
    currentTime: 0,
    songList: [],
};

app.use(express.json());

app.get("/", (req, res) => {
    const filePath = path.resolve(__dirname, "client.html");
    console.log("looking for:", filePath);
    res.setHeader("Content-Type", "text/html");
    res.send(require("fs").readFileSync(filePath, "utf8"));
});

app.use("/api", routes);

io.on("connection", (socket) => {
    console.log("device connected:", socket.id);

    socket.emit("syncState", playerState);

    socket.on("play", () => {
        playerState.isPlaying = true;
        socket.broadcast.emit("play");
    });

    socket.on("pause", () => {
        playerState.isPlaying = false;
        socket.broadcast.emit("pause");
    });

    socket.on("next", () => {
        playerState.currentIndex++;
        socket.broadcast.emit("next");
    });

    socket.on("prev", () => {
        playerState.currentIndex--;
        socket.broadcast.emit("prev");
    });

    socket.on("seek", (time) => {
        playerState.currentTime = time;
        socket.broadcast.emit("seek", time);
    });

    socket.on("songChange", (index) => {
        playerState.currentIndex = index;
        socket.broadcast.emit("songChange", index);
    });

    socket.on("timeUpdate", (time) => {
        playerState.currentTime = time;
    });

    socket.on("songList", (list) => {
        playerState.songList = list;
    });

    socket.on("disconnect", () => {
        console.log("device disconnected:", socket.id);
    });
});

const startServer = (musicPath) => {
    app.locals.musicPath = musicPath;
    
    server.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on port ${PORT}`);
    });
};

const setMusicPath = (newPath) => {
    app.locals.musicPath = newPath;
};

module.exports = { startServer, setMusicPath, io };