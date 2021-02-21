const mongoose = require("mongoose");

const category = mongoose.model("Category", new mongoose.Schema({
  category_name: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now()
  },
  products: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Product",
    default: []
  },
  ilanlar: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Ilan",
    default: []
  }
}));

module.exports = category;