const path = require("path");
const http = require("http");
const express = require("express");
const socketIO = require("socket.io");

const rooms = new Map();
const socketToRoom = new Map();

const publicPath = path.join(__dirname, "/../public");
const port = process.env.PORT || 3000;

let app = express();

app.get("/r/:roomId", (req, res) => {
  res.sendFile(path.join(publicPath, "/index.html"));
});

let server = http.createServer(app);
let io = socketIO(server);

io.on("connection", (socket) => {
  socket.on("join", (data) => {
    socketToRoom.set(socket.id, data.roomId);

    let currentState = rooms.get(data.roomId);
    if (!currentState) {
      currentState = { numPlayers: 1 };
    } else {
      currentState.numPlayers++;
    }

    rooms.set(data.roomId, currentState);

    console.log(`user joined, socketId=${socket.id}, roomId=${data.roomId}`);
    io.emit("gameState", currentState);
  });

  socket.on("disconnect", () => {
    let roomId = socketToRoom.get(socket.id);

    if (!roomId) {
      console.warn(`disconnect with no room, socketId=${socket.id}`);
      return;
    }

    let state = rooms.get(roomId);
    state.numPlayers--;

    if (state.numPlayers === 0) {
      rooms.delete(roomId);
    }

    rooms.set(roomId, state);
    console.log(`user left, socketId=${socket.id}, roomId=${roomId}`);
  });
});

app.use(express.static(publicPath));

server.listen(port, () => {
  console.log(`server is up on http://localhost:${port}`);
});
