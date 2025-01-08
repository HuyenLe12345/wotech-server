const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const chatSchema = new Schema({
  conversation: [
    {
      message: {
        type: String,
        required: false,
      },
      is_admin: {
        type: Boolean,
        required: false,
      },
    },
  ],
});

module.exports = mongoose.model("chat", chatSchema);
