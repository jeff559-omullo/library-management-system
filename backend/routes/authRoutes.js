const router = require("express").Router();
const controller = require("../controllers/authController");

router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/create-admin", controller.createAdmin);
module.exports = router;