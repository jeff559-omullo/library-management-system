const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const Book = require("../models/Book");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const controller = require("../controllers/transactionController");

/* =============================
   STUDENT ROUTES
============================= */

// Reserve a book (uses controller)
router.post("/reserve/:bookId", auth, role("student"), controller.reserveBook);

// Return a book
router.post("/return/:id", auth, role("student"), controller.returnBook);

// Get logged-in student's transactions
router.get("/my", auth, role("student"), controller.getMyTransactions);

// Pay fine for a transaction
router.post("/pay/:id", auth, role("student"), controller.payFine);

/* =============================
   LIBRARIAN / ADMIN ROUTES
============================= */

// Get all transactions (librarian/admin only)
router.get("/all", auth, role("librarian", "admin"), async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("student")
      .populate("book")
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin statistics
router.get("/admin-stats", auth, role("admin"), async (req, res) => {
  try {
    const totalTransactions = await Transaction.countDocuments();
    const borrowed = await Transaction.countDocuments({ status: "borrowed" });
    const returned = await Transaction.countDocuments({ status: "returned" });

    const overdue = await Transaction.countDocuments({
      status: "borrowed",
      dueDate: { $lt: new Date() }
    });

    const totalFines = await Transaction.aggregate([
      { $group: { _id: null, total: { $sum: "$fine" } } }
    ]);

    res.json({
      totalTransactions,
      borrowed,
      returned,
      overdue,
      totalFines: totalFines[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;