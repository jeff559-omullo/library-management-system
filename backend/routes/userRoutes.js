const router = require("express").Router();
const controller = require("../controllers/userController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");
const User = require("../models/User");

// Admin actions
router.post("/create-librarian", auth, role("admin"), controller.createLibrarian);
router.get("/", auth, role("admin"), controller.getUsers);
router.delete("/:id", auth, role("admin"), controller.deleteUser);

// 🔥 CURRENT USER
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;