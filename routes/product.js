const express = require("express");

const productController = require("../controllers/product");
const router = express.Router();
router.get("/pagination", productController.getPagination);
router.get(`/:productId`, productController.getProductDetail);
router.get("", productController.getProducts);

module.exports = router;
