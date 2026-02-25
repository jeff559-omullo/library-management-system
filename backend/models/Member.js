const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  regNo: { type: String, unique: true },
  phone: String,
  email: String
}, { timestamps: true });

module.exports = mongoose.model("Member", memberSchema);