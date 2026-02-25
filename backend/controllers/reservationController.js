const Book = require("../models/Book");
const Transaction = require("../models/Transaction");

exports.reserveBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.bookId);
    if (!book) return res.status(404).json({ message: "Book not found" });

    if (book.available <= 0)
      return res.status(400).json({ message: "No copies available" });

    const studentId = req.body.memberId || req.user.id;

    const existing = await Transaction.findOne({
      student: studentId,
      book: book._id,
      status: "borrowed"
    });

    if (existing)
      return res.status(400).json({ message: "Book already borrowed by this user" });

    book.available -= 1;
    await book.save();

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    const transaction = await Transaction.create({
      student: studentId,
      book: book._id,
      dueDate,
      issuedBy: req.user.role === "librarian" ? req.user.id : null
    });

    res.json(transaction);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.returnBook = async (req, res) => {
    try {
      const transaction = await Transaction.findById(req.params.id).populate("book");
  
      if (!transaction) return res.status(404).json({ message: "Not found" });
  
      if (transaction.status === "returned")
        return res.status(400).json({ message: "Already returned" });
  
      const today = new Date();
      transaction.returnDate = today;
      transaction.status = "returned";
  
      // fine calculation
      if (today > transaction.dueDate) {
        const lateDays = Math.ceil(
          (today - transaction.dueDate) / (1000 * 60 * 60 * 24)
        );
        transaction.fine = lateDays * 50; // 50 per day
      }
  
      await transaction.save();
  
      // increase book available
      transaction.book.available += 1;
      await transaction.book.save();
  
      res.json(transaction);
  
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  exports.getMyTransactions = async (req, res) => {
    try {
      const transactions = await Transaction.find({ student: req.user.id })
        .populate("book")
        .sort({ createdAt: -1 });
  
      res.json(transactions);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };