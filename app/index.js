const path = require("path");
const express = require("express");
const cors = require("cors");
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
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.get("/", (_req, res) => {
  res.sendFile(path.join(public, "index.html"));
});

const io = require("socket.io")({ serveClient: false });
io.on("connect", (socket) => {
  socket.on("create", ({ roomName, password }) => {
    Room.findOne({ name: roomName }, async (error, room) => {
      if (error || room) {
        return;
      }
      try {
        const hashedPassword = await hash(password, 10);
        const doc = new Room({
          name,
          password: hashedPassword,
          adminId: socket.id,
        });
        await doc.save();
      } catch (error) {
        console.error(error);
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
    const rooms = socket.rooms.slice();
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

const port = process.env.PORT !== undefined ? process.env.PORT : 8080;
app.listen(port, () => console.log(`Listening on ${port}`));
