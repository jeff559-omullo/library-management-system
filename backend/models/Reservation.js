const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  book: { type: mongoose.Schema.Types.ObjectId, ref: "Book" },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, default: "Pending" }
});

module.exports = mongoose.model("Reservation", reservationSchema);