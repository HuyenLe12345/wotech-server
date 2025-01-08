const express = require("express");
const historyController = require("../controllers/history");
const { checkAuth } = require("../middleware/checkAuth");

const router = express.Router();

router.get("/:orderId", checkAuth, historyController.getDetail);
router.get("", checkAuth, checkAuth, historyController.getHistory);

module.exports = router;
