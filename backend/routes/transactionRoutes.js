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

// Reserve (Block E-books)
router.post("/reserve/:bookId", auth, role("student"), async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);

    if (!book) return res.status(404).json({ message: "Book not found" });

    if (book.isEbook) {
      return res.status(400).json({
        message: "E-Books cannot be reserved. Read online only."
      });
    }

    if (book.available <= 0) {
      return res.status(400).json({ message: "No copies available" });
    }

    book.available -= 1;
    await book.save();

    const transaction = await Transaction.create({
      student: req.user.id,
      book: book._id,
      status: "borrowed",
      borrowDate: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    res.json(transaction);

  } catch (err) {
    res.status(500).json({ message: "Reserve failed" });
  }
});

router.post("/return/:id", auth, role("student"), controller.returnBook);

router.get("/my", auth, role("student"), controller.getMyTransactions);

router.post("/pay/:id", auth, role("student"), controller.payFine);


/* =============================
   LIBRARIAN / ADMIN ROUTES
============================= */

router.get("/all", auth, role("librarian", "admin"), async (req, res) => {
  const transactions = await Transaction.find()
    .populate("student")
    .populate("book")
    .sort({ createdAt: -1 });

  res.json(transactions);
});


router.get("/admin-stats", auth, role("admin"), async (req, res) => {
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
});

module.exports = router;