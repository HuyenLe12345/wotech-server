const express = require("express");
const { checkAuth } = require("../middleware/checkAuth");
const cartController = require("../controllers/cart");

const router = express.Router();
router.post("/check", checkAuth, cartController.postCheckNumberOfProduct);
router.delete("/delete", checkAuth, cartController.deleteCart);
router.put("/update", checkAuth, cartController.putToCart);
router.post("/add", checkAuth, cartController.postAddToCart);
router.get("", checkAuth, cartController.getCarts);
module.exports = router;
