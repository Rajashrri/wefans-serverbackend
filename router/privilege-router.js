const express = require("express");
const router = express.Router();
const Privilegecontrollers = require("../controllers/privilege-controller");


router.route("/getPriByid/:id").get(Privilegecontrollers.getPriByid);

router.route("/setprivileges/:id").patch(Privilegecontrollers.setprivileges);
router.route("/getprivileges/:id").get(Privilegecontrollers.getprivileges);

module.exports = router;