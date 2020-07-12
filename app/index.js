require("dotenv").config();
const rimraf = require("rimraf");
const setupWebsocket = require("./websocket");
const app = require("./express");
const Room = require("./database");

const port = process.env.PORT !== undefined ? process.env.PORT : 8080;
const listeningApp = app.listen(port, () =>
  console.log(`Listening on ${port}`)
);
const io = require("socket.io")(listeningApp);
setupWebsocket(io);

// So the program will not close instantly
process.stdin.resume();

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

process.on("exit", exitHandler);

// Catches ctrl+c event
process.on("SIGINT", exitHandler);

// Catches "kill pid"
process.on("SIGUSR1", exitHandler);
process.on("SIGUSR2", exitHandler);
