const express = require("express");
const path = require("path");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

server.listen(3000, () => console.log("RUNNING"));

app.use(express.static(path.join(__dirname, "public")));

let connectedUsers = [];

io.on("connection", (socket) => {
    console.log("CONEXÃO DETECTADA...");

    socket.on("join-request", (username) => {
        socket.username = username;
        connectedUsers.push(username);
        console.log(connectedUsers);

        socket.emit("user-ok", connectedUsers);

        socket.broadcast.emit("list-update", {
            joined: username,
            list: connectedUsers
        });
    });

    socket.on("disconnect", () => {
        connectedUsers = connectedUsers.filter(u => u != socket.username);

        socket.broadcast.emit("list-update", {
            left: socket.username,
            list: connectedUsers
        });
    });

    socket.on("send-msg", (msg) => {

        let obj = {
            username: socket.username,
            message: msg
        }

        socket.emit("show-msg", obj);
        socket.broadcast.emit("show-msg", obj);
    });

});