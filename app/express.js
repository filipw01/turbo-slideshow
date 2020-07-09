const express = require("express");
const cors = require("cors");
const SocketIOFileUpload = require("socketio-file-upload");
const path = require("path");

const publicPath = path.join(__dirname, "frontend", "dist");

const app = express();
app.use(express.static(publicPath));
app.use(express.json());
app.use(cors());
app.use(SocketIOFileUpload.router);

app.get("/", (_req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

app.post("/srv/:adminSocketId/:fileName", (req, res) => {
  const password = req.body.password;
  Room.findOne({ adminId: req.params.adminSocketId }, async (error, room) => {
    if (!room || error) {
      return res.send({ error });
    }
    const correctPassword = compare(password, room.password);
    if (correctPassword) {
      return res.sendFile(req.url);
    }
    res.send({ error: "incorrect password" });
  });
});

module.exports = app;
