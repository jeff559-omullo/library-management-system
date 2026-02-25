const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const Book = require("../models/Book");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const upload = require("../middleware/upload");

// GET ALL BOOKS
router.get("/", auth, async (req, res) => {
  const books = await Book.find().sort({ createdAt: -1 });
  res.json(books);
});

// CREATE BOOK (PDF + IMAGE)
router.post(
  "/",
  auth,
  role("librarian"),
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "ebookFile", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { title, author, isbn, copies } = req.body;

      const existing = await Book.findOne({ isbn });
      if (existing) {
        return res.status(400).json({ message: "ISBN already exists" });
      }

      const isEbook = !!req.files?.ebookFile;

      
      const book = await Book.create({
        title,
        author,
        isbn,
        copies,
        available: copies,
        isEbook: !!req.files.ebookFile, // 👈 auto detect ebook
        coverImage: req.files.coverImage?.[0]?.filename,
        ebookFile: req.files.ebookFile?.[0]?.filename
      });
      
      

      res.json(book);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Upload failed" });
    }
  }
);

// STREAM PDF (NO DIRECT DOWNLOAD)
router.get("/read/:id", auth, async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (!book || !book.ebookFile) {
    return res.status(404).json({ message: "E-Book not found" });
  }

  const filePath = path.join(__dirname, "..", "uploads", book.ebookFile);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File missing" });
  }

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "inline"); // 👈 no attachment

  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
});

// DELETE BOOK
router.delete("/:id", auth, role("librarian"), async (req, res) => {
  await Book.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

module.exports = router;