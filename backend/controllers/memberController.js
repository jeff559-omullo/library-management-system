const Member = require("../models/Member");

/* ================= CREATE MEMBER ================= */
exports.createMember = async (req, res) => {
  try {
    const { name, regNo, phone, email } = req.body;

    if (!name || !regNo) {
      return res.status(400).json({ message: "Name and Reg No required" });
    }

    const existing = await Member.findOne({ regNo });
    if (existing) {
      return res.status(400).json({ message: "Member already exists" });
    }

    const member = await Member.create({
      name,
      regNo,
      phone,
      email
    });

    res.status(201).json(member);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= GET ALL MEMBERS ================= */
exports.getMembers = async (req, res) => {
  try {
    const members = await Member.find();
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/* ================= DELETE MEMBER ================= */
exports.deleteMember = async (req, res) => {
  try {
    await Member.findByIdAndDelete(req.params.id);
    res.json({ message: "Member deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};