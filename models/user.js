const mongoose = require("mongoose");

const user = mongoose.model("User", new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  },
  user_name: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true
  },
  profile_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
    required: true
  },
  profile_type: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Yetki",
    required: true,
    unique: true
  }
}));

module.exports = user;