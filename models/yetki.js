const mongoose = require("mongoose");

const yetki = mongoose.model("Yetki", new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true
  },
  profile_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true
  },
  yetki: {
    type: String,
    enum:["admin","normal","magaza"],
    default: "normal"
  }
}));

module.exports = yetki;