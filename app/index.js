const path = require("path");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { hash } = require("bcrypt");
const { nanoid } = require("nanoid");
const cookieParser = require("cookie-parser");
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

const public = path.join(__dirname, "frontend", "dist");

app.use(express.json());
app.use(cookieParser());
app.use(express.static(public));
app.use(
  cors({
    origin: "http://localhost:3000",
  })
);

app.get("/", (req, res) => {
  res.sendFile(path.join(public, "index.html"));
});
app.post("/create", async (req, res) => {
  const { name, password } = req.body;
  const adminId = nanoid();
  try {
    const hashedPassword = await hash(password, 10);
    const doc = new Room({ name, password: hashedPassword, adminId });
    await doc.save();
  } catch (error) {
    console.error(error);
  }
  console.log(adminId);
  res.cookie("adminId", adminId, { httpOnly: true });
  res.send(adminId);
});

app.get("/join/:roomName", (req, res) => {
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
