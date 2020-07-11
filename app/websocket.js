const Room = require("./database");
const rimraf = require("rimraf");
const { hash, compare } = require("bcrypt");
const setupFileUpload = require("./fileUpload");

function setup(io) {
  io.on("connect", (socket) => {
    const uploadDir = `/srv/${socket.id}`;

    socket.on("create", ({ name, password }) => {
      Room.findOne({ name }, async (error, room) => {
        if (error) {
          return socket.emit("create/error", "Couldn't create new room");
        }
        if (room) {
          return socket.emit("create/error", "Room already exists");
        }
        try {
          const hashedPassword = await hash(password, 10);
          const doc = new Room({
            name,
            password: hashedPassword,
            adminId: socket.id,
          });
          await doc.save();
          socket.emit("create/success", room);

          setupFileUpload(socket);
        } catch (error) {
          return socket.emit("create/error", error);
        }
      });
    });

    socket.on("join", ({ name, password }) => {
      Room.findOne({ name }, async (error, room) => {
        if (error) {
          return socket.emit("join/error", "Couldn't join the room");
        }
        if (!room) {
          return socket.emit("join/error", "No room found");
        }
        const correctPassword = await compare(password, room.password);
        if (correctPassword) {
          socket.join(`room:${name}`);
          socket.emit("join/success");
          if (room.presentationPath) {
            return socket.emit("changePresentation", room.presentationPath);
          }
        } else {
          socket.emit("join/error", "Incorrect password");
        }
      });
    });

    socket.on("changePage", (pageNumber) => {
      Room.findOne({ adminId: socket.id }, (error, room) => {
        if (error || !room) {
          return socket.emit("changePage/error", "Couldn't change the page");
        }
        socket.to(`room:${room.name}`).emit("changePage", pageNumber);
        socket.emit("changePage", pageNumber);
      });
    });

    socket.on("disconnecting", () => {
      const rooms = Object.values(socket.rooms);
      for (const room of rooms) {
        Room.findOne({ name: room.slice(5) }, (error, databaseRoom) => {
          if (error || !databaseRoom) {
            return console.error(error);
          }
          if (databaseRoom.adminId === socket.id) {
            Room.deleteOne({ name: databaseRoom.name }, function (error) {
              console.error(error);
            });
            rimraf(uploadDir, (err) => {
              if (err) {
                return console.error(error);
              }
              console.log(uploadDir, " directory was deleted");
            });
          }
        });
      }
    });
  });
}

module.exports = setup;
