module.exports = function setup(io) {
  const fs = require("fs");
  const SocketIOFileUpload = require("socketio-file-upload");
  const { hash, compare } = require("bcrypt");
  const libre = require("libreoffice-convert");

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
};
