const router = require("express").Router();
const controller = require("../controllers/reservationController");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.post("/", auth, role(["student"]), controller.createReservation);
router.get("/", auth, role(["admin", "librarian"]), controller.getReservations);

module.exports = router;