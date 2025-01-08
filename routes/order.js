const express = require("express");
const { checkAuth } = require("../middleware/checkAuth");
const orderController = require("../controllers/order");
const router = express.Router();

router.post("/info", checkAuth, orderController.postInfo);
router.post("/email", checkAuth, orderController.postEmail);

module.exports = router;
