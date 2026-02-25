const express = require("express");
const router = express.Router();
const controller = require("../controllers/memberController");

router.post("/", controller.createMember);
router.get("/", controller.getMembers);
router.delete("/:id", controller.deleteMember);

module.exports = router;