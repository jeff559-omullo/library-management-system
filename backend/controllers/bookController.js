const Book = require("../models/Book");

/* ================= CREATE BOOK ================= */
exports.createBook = async (req, res) => {
  try {
    const { title, author, isbn, copies } = req.body;

    const existing = await Book.findOne({ isbn });

    if (existing) {
      // Instead of throwing error, increase copies
      existing.copies += Number(copies);
      existing.available += Number(copies);
      await existing.save();
      return res.json(existing);
    }

    const book = await Book.create({
      title,
      author,
      isbn,
      copies: Number(copies),
      available: Number(copies)
    });

    res.json(book);

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

/* ================= GET ALL BOOKS ================= */
exports.getBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= DELETE BOOK ================= */
exports.deleteBook = async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};