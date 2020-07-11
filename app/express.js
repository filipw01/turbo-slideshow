const express = require("express");
const cors = require("cors");
const SocketIOFileUpload = require("socketio-file-upload");
const path = require("path");
const Room = require("./database");
const publicPath = path.join(__dirname, "frontend", "dist");
const { compare } = require("bcrypt");

const app = express();
app.use(express.static(publicPath));
app.use(express.json());
app.use(cors());
app.use(SocketIOFileUpload.router);

app.get("/", (_req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

// Send presentation file if user has access to admin folder
app.post("/srv/:adminId/:fileName", (req, res) => {
  const { password } = req.body;
  const { adminId } = req.params;
  Room.findOne({ adminId }, async (error, room) => {
    if (!room || error) {
      return res.send({ error: "Presentation file couldn't be downloaded" });
    }
    const correctPassword = compare(password, room.password);
    if (correctPassword) {
      return res.sendFile(req.url);
    }
    res.send({ error: "incorrect password" });
  });
});

module.exports = app;
