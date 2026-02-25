const User = require("../models/User");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
    try {
      const { name, email, password } = req.body;
  
      const existing = await require("../models/User").findOne({ email });
      if (existing) {
        return res.status(400).json({ message: "User already exists" });
      }
  
      const user = await require("../models/User").create({
        name,
        email,
        password,
        role: "student" // force student
      });
  
      res.json({ message: "Account created successfully" });
  
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  const isMatch = await require("bcryptjs").compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid password" });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token, role: user.role });
};
exports.createAdmin = async (req, res) => {
    const User = require("../models/User");
    const user = await User.create({
      name: "Admin",
      email: "admin@library.com",
      password: "123456",
      role: "admin"
    });
    res.json(user);
  };


