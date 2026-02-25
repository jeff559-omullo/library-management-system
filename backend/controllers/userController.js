const User = require("../models/User");

exports.createLibrarian = async (req, res) => {
  const { name, email, password } = req.body;

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: "User exists" });

  const librarian = await User.create({
    name,
    email,
    password,
    role: "librarian"
  });

  res.json(librarian);
};

exports.getUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};

exports.deleteUser = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
};