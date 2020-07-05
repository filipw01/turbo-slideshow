const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const { hash, compare } = require("bcrypt");
const app = express();
require("dotenv").config();

mongoose.connect("mongodb://mongo:27017", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const roomSchema = new mongoose.Schema({
  name: String,
  password: String,
  adminId: String,
});

const Room = new mongoose.model("Room", roomSchema);

const public = path.join(__dirname, "frontend", "dist");

app.use(express.static(public));

app.get("/", (_req, res) => {
  res.sendFile(path.join(public, "index.html"));
});
const port = process.env.PORT !== undefined ? process.env.PORT : 8080;
const listeningApp = app.listen(port, () =>
  console.log(`Listening on ${port}`)
);

const io = require("socket.io")(listeningApp);
io.on("connect", (socket) => {
  socket.on("create", ({ name, password }) => {
    Room.findOne({ name }, async (error, room) => {
      if (error || room) {
        return socket.emit("create/error", error);
      }
      try {
        const hashedPassword = await hash(password, 10);
        const doc = new Room({
          name,
          password: hashedPassword,
          adminId: socket.id,
        });
        await doc.save();
        return socket.emit("create/success", room);
      } catch (error) {
        return socket.emit("create/error", error);
      }
    });
  });

  socket.on("join", ({ name, password }) => {
    Room.findOne({ name }, async (error, room) => {
      if (error) {
        console.error(error);
      }
      const correctPassword = await compare(password, room.password);
      if (room && correctPassword) {
        socket.join(`room:${name}`);
        return socket.emit("join/success");
      }
      socket.emit("join/error");
    });
  });

  socket.on("changePage", (pageNumber) => {
    Room.findOne({ adminId: socket.id }, (error, room) => {
      if (!error && room) {
        socket.to(`room:${room.name}`).emit("changePage", pageNumber);
      }
    });
  });

  socket.on("disconnecting", () => {
    const rooms = Object.values(socket.rooms);
    for (const room of rooms) {
      Room.findOne({ name: room.slice(5) }, (error, databaseRoom) => {
        if (error) {
          console.error(error);
        }
        if (databaseRoom) {
          if (databaseRoom.adminId === socket.id) {
            Room.deleteOne({ name: databaseRoom.name }, function (err) {});
          }
        }
      });
    }
  });
});
