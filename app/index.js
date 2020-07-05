const express = require("express");
const mongoose = require("mongoose");
const { hash } = require("bcrypt");
const { nanoid } = require("nanoid");
const app = express();
require("dotenv").config();

mongoose.connect("mongodb://localhost:27017", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const roomSchema = new mongoose.Schema({
  name: String,
  password: String,
  adminId: String,
});

const Room = new mongoose.model("Room", roomSchema);

app.post("/room", async (req, res) => {
  const { name, password } = req.body;
  const adminId = nanoid();
  try {
    const hashedPassword = await hash(password, 10);
    const doc = new Room({ name, password: hashedPassword, adminId });
    await doc.save();
  } catch (error) {
    console.error(error);
  }
  res.cookie.set("adminId", adminId);
  res.send(adminId);
});

app.get("/room/:roomName", (req, res) => {
  mongoose.model.findOne("Room", { name: roomName }, (error, room) => {
    if (error) {
      console.error(error);
    }
    if (room) {
      res.send(room.name);
    }
  });
});

const io = require("socket.io")(80);
io.on("connect", (socket) => {
  socket.on("join", (roomName) => {
    mongoose.model.findOne("Room", { name: roomName }, (error, room) => {
      if (error) {
        console.error(error);
      }
      if (room) {
        socket.join(`room:${roomName}`);
      }
    });
  });
  socket.on("disconnecting", () => {
    const rooms = socket.rooms.slice();
    for (const room of rooms) {
      const adminId = cookie.adminId;
      mongoose.model.findOne("Room", { adminId }, (error, databaseRoom) => {
        if (error) {
          console.error(error);
        }
        if (databaseRoom) {
        }
      });
    }
  });
});

const port = process.env.PORT !== undefined ? process.env.PORT : 8080;
app.listen(port, () => console.log(`Listening on ${port}`));
