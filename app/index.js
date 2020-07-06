const libre = require("libreoffice-convert");
const rimraf = require("rimraf");
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");
const cors = require("cors");
const SocketIOFileUpload = require("socketio-file-upload");
const { hash, compare } = require("bcrypt");
const app = express();
require("dotenv").config();

mongoose.set("useFindAndModify", false);
mongoose.connect("mongodb://mongo:27017", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const roomSchema = new mongoose.Schema({
  name: String,
  password: String,
  adminId: String,
  presentationPath: String,
});

const Room = new mongoose.model("Room", roomSchema);

const public = path.join(__dirname, "frontend", "dist");

app.use(express.static(public));
app.use(express.json());
app.use(cors());
app.use(SocketIOFileUpload.router);

app.get("/", (_req, res) => {
  res.sendFile(path.join(public, "index.html"));
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

const port = process.env.PORT !== undefined ? process.env.PORT : 8080;
const listeningApp = app.listen(port, () =>
  console.log(`Listening on ${port}`)
);

const updateRoomFilePath = (socket, filePath) => {
  Room.findOne({ adminId: socket.id }, (error, room) => {
    if (!error && room.presentationPath) {
      fs.unlink(room.presentationPath, (err) => {
        if (err) throw err;
        console.log(room.presentationPath, " was deleted");
      });
    }
  });
  Room.findOneAndUpdate(
    { adminId: socket.id },
    { presentationPath: filePath },
    (error, room) => {
      if (!error && room) {
        console.log(filePath, " received");
        socket.to(`room:${room.name}`).emit("changePresentation", filePath);
        socket.emit("changePresentation", filePath);
      }
    }
  );
};

const io = require("socket.io")(listeningApp);
io.on("connect", (socket) => {
  const uploadDir = `/srv/${socket.id}`;

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

        const uploader = new SocketIOFileUpload();
        fs.mkdirSync(uploadDir);
        uploader.dir = uploadDir;
        uploader.listen(socket);
        uploader.on("saved", function (event) {
          let filePath = event.file.pathName;
          const file = fs.readFileSync(filePath);
          const extension = path.extname(filePath);
          const baseName = path.basename(filePath, extension);
          if (extension === ".pdf") {
            updateRoomFilePath(socket, filePath);
          } else {
            filePath = `${uploadDir}/${baseName}.pdf`;
            // Convert it to pdf format with undefined filter (see Libreoffice doc about filter)
            libre.convert(file, ".pdf", undefined, (err, done) => {
              if (err) {
                console.log(`Error converting file: ${err}`);
              }
              // Here in done you have pdf file which you can save or transfer in another stream
              fs.writeFileSync(filePath, done);
              updateRoomFilePath(socket, filePath);
            });
          }
        });
        // Error handler:
        uploader.on("error", function (event) {
          console.log("Error from uploader", event);
        });

        return socket.emit("create/success", room);
      } catch (error) {
        return socket.emit("create/error", error);
      }
    });
  });

  socket.on("join", ({ name, password }) => {
    Room.findOne({ name }, async (error, room) => {
      if (!room || error) {
        return socket.emit("join/error");
      }
      const correctPassword = await compare(password, room.password);
      if (correctPassword) {
        socket.join(`room:${name}`);
        socket.emit("join/success");
        if (room.presentationPath) {
          return socket.emit("changePresentation", room.presentationPath);
        }
      }
      socket.emit("join/error,", "incorrect password");
    });
  });

  socket.on("changePage", (pageNumber) => {
    Room.findOne({ adminId: socket.id }, (error, room) => {
      if (!error && room) {
        socket.to(`room:${room.name}`).emit("changePage", pageNumber);
        socket.emit("changePage", pageNumber);
      }
    });
  });

  socket.on("disconnecting", () => {
    rimraf(uploadDir, (err) => {
      if (err) throw err;
      console.log(uploadDir, " directory was deleted");
    });
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

process.stdin.resume(); //so the program will not close instantly

function exitHandler() {
  Room.deleteMany({}, (error) => {
    if (error) {
      console.log("Couldn't clean the database");
    } else {
      console.log("Cleaned the database");
    }
    rimraf("/srv/*", () => {
      if (error) {
        console.log("Couldn't clean the files");
      } else {
        console.log("Cleaned the files");
      }
      process.exit();
    });
  });
}

//do something when app is closing
process.on("exit", exitHandler);

//catches ctrl+c event
process.on("SIGINT", exitHandler);

// catches "kill pid" (for example: nodemon restart)
process.on("SIGUSR1", exitHandler);
process.on("SIGUSR2", exitHandler);

//catches uncaught exceptions
// process.on("uncaughtException", exitHandler);
