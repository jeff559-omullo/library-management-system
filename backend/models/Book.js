const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String, unique: true },
  copies: { type: Number, default: 0 },
  available: { type: Number, default: 0 },

  // E-book fields
  isEbook: { type: Boolean, default: false },
  ebookFile: { type: String },
  coverImage: { type: String }

}, { timestamps: true });

module.exports = mongoose.model("Book", bookSchema);