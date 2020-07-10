const fs = require("fs");
const path = require("path");
const SocketIOFileUpload = require("socketio-file-upload");
const libre = require("libreoffice-convert");

function updateRoomFilePath(socket, filePath) {
  Room.findOne({ adminId: socket.id }, (error, room) => {
    if (error || !room.presentationPath) {
      throw "Couldn't update presentation file";
    }
    fs.unlink(room.presentationPath, (err) => {
      if (err) throw "Couldn't update presentation file";
      console.log(room.presentationPath, "was deleted");
    });
  });
  Room.findOneAndUpdate(
    { adminId: socket.id },
    { presentationPath: filePath },
    (error, room) => {
      if (!error && room) {
        console.log(filePath, "has been received");
        socket.to(`room:${room.name}`).emit("changePresentation", filePath);
        socket.emit("changePresentation", filePath);
      } else {
        socket.emit(
          "changePresentation/error",
          "Couldn't update presentation file"
        );
      }
    }
  );
}

function setup(socket) {
  const fileUpload = new SocketIOFileUpload();
  fs.mkdirSync(uploadDir);
  fileUpload.dir = uploadDir;
  fileUpload.listen(socket);
  fileUpload.on("saved", function (event) {
    let filePath = event.file.pathName;
    const file = fs.readFileSync(filePath);
    const extension = path.extname(filePath);
    const baseName = path.basename(filePath, extension);
    if (extension === ".pdf") {
      try {
        updateRoomFilePath(socket, filePath);
      } catch (error) {
        socket.emit("changePresentation/error", error);
      }
    } else {
      filePath = `${uploadDir}/${baseName}.pdf`;
      // Convert it to pdf format with undefined filter (see Libreoffice doc about filter)
      libre.convert(file, ".pdf", undefined, (err, done) => {
        if (err) {
          console.log(`Error converting file: ${err}`);
          return socket.emit(
            "changePresentation/error",
            "Error converting file to PDF"
          );
        }
        // Here in done you have pdf file which you can save or transfer in another stream
        fs.writeFileSync(filePath, done);
        try {
          updateRoomFilePath(socket, filePath);
        } catch (error) {
          socket.emit("changePresentation/error", error);
        }
      });
    }
  });
  // Error handler:
  fileUpload.on("error", function (event) {
    socket.emit("changePresentation/error", "Couldn't upload the file");
    console.log("Error from fileUpload", event);
  });
}

module.exports = setup;
