const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const { hash } = require("bcrypt");
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
  participants: Number,
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
    console.log();
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

  socket.on("join", ({ roomName, password }) => {
    Room.findOne({ name: roomName }, (error, room) => {
      if (error) {
        console.error(error);
      }
      if (room && room.password === password) {
        Room.updateOne(
          { name: roomName },
          { participants: room.participants + 1 }
        );
        socket.join(`room:${roomName}`);
      }
    });
  });

  socket.on("disconnecting", () => {
    const rooms = Object.values(socket.rooms);
    for (const room of rooms) {
      if ((room.participants = 1)) {
        Room.deleteOne({ name: room.name });
        continue;
      } else {
        Room.updateOne(
          { name: room.name },
          { participants: room.participants - 1 }
        );
      }
      Room.findOne({ adminId: socket.id }, (error, databaseRoom) => {
        if (error) {
          console.error(error);
        }
        if (databaseRoom) {
          Room.deleteOne({ name: databaseRoom.name }, () => {});
        }
      });
    }
  });
});
