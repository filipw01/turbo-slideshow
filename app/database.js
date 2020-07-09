const mongoose = require("mongoose");

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

module.exports = Room;
