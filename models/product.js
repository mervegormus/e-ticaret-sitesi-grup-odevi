const mongoose = require("mongoose");

const product = mongoose.model("Product", new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    default: 0
  },
  desc: {
    type: String,
    default: ""
  },
  inventory: {
    type: Number,
    default: 0
  },
  like_count: {
    type: Number,
    default: 0
  },
  images: {
    type: [String],
    default: []
  },
  created_at: {
    type: Date,
    default: Date.now()
  },
  listed_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
    required: true
  },
  isListing: {
    type: Boolean,
    default: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },
  fav_count: {
    type: Number,
    default: 0
  },
  faved_users: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Profile",
    default: []
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  updated_at: {
    type: Date,
    default: Date.now()
  },
  thumbnail: {
    type: String,
  },
  _type: {
    type: String,
    default: "product"
  }
}));

module.exports = product;