const rimraf = require("rimraf");
const setupWebsocket = require("./websocket");
const app = require("./express");
const Room = require("./database");
require("dotenv").config();

const port = process.env.PORT !== undefined ? process.env.PORT : 8080;
const listeningApp = app.listen(port, () =>
  console.log(`Listening on ${port}`)
);
const io = require("socket.io")(listeningApp);
setupWebsocket(io);

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
