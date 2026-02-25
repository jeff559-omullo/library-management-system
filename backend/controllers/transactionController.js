const Book = require("../models/Book");
const Transaction = require("../models/Transaction");


// ================== RESERVE / BORROW ==================
exports.reserveBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);

    if (!book)
      return res.status(404).json({ message: "Book not found" });

    if (book.available <= 0)
      return res.status(400).json({ message: "No copies available" });

    // Prevent student borrowing same book twice
    const existing = await Transaction.findOne({
      student: req.user.id,
      book: book._id,
      status: "borrowed"
    });

    if (existing)
      return res.status(400).json({ message: "You already borrowed this book" });

    // reduce stock
    book.available -= 1;
    await book.save();

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    const transaction = await Transaction.create({
      student: req.user.id,
      book: book._id,
      dueDate
    });

    res.json(transaction);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ================== RETURN ==================
exports.returnBook = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate("book");

    if (!transaction)
      return res.status(404).json({ message: "Transaction not found" });

    if (transaction.status === "returned")
      return res.status(400).json({ message: "Already returned" });

    const today = new Date();

    transaction.returnDate = today;
    transaction.status = "returned";

    // Fine calculation
    if (today > transaction.dueDate) {
      const lateDays = Math.ceil(
        (today - transaction.dueDate) / (1000 * 60 * 60 * 24)
      );
      transaction.fine = lateDays * 50;
    }

    await transaction.save();

    // restore stock
    transaction.book.available += 1;
    await transaction.book.save();

    res.json(transaction);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ================== STUDENT REPORT ==================
exports.getMyTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      student: req.user.id
    })
      .populate("book")
      .sort({ createdAt: -1 });

    res.json(transactions);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.payFine = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction)
      return res.status(404).json({ message: "Transaction not found" });

    if (transaction.fine <= 0)
      return res.status(400).json({ message: "No fine to pay" });

    transaction.finePaid = true;
    transaction.paymentDate = new Date();

    await transaction.save();

    res.json({ message: "Fine paid successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};