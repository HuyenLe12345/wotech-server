const express = require("express");
const { query } = require("express-validator");
const { checkConsultAdmin, checkAdmin } = require("../middleware/checkAuth");

const adminController = require("../controllers/admin");
const productController = require("../controllers/product");

const router = express.Router();
//login
router.post(
  "/login",
  [query("email").isEmail().withMessage("Your email address is incorrect")],
  adminController.postLogin
);

// get latest orders
router.get("/histories/all", checkAdmin, adminController.getHistoryAll);

// products
router.get(
  "/products/pagination",
  checkConsultAdmin,
  productController.getPagination
);
router.delete(
  "/products/delete/:id",
  checkAdmin,
  adminController.deleteProduct
);
router.get(
  "/products/:productId",
  checkAdmin,
  productController.getProductDetail
);
router.post(
  "/products/update/:productId",
  checkAdmin,
  adminController.updateProduct
);
router.get("/products", checkConsultAdmin, productController.getProducts);
router.post("/add-product", checkAdmin, adminController.postAddNewProduct);
//chat
router.get(
  "/chatRooms/getAllRoom",
  checkConsultAdmin,
  adminController.getAllRoom
);
router.get(
  "/chatrooms/getById",
  checkConsultAdmin,
  adminController.getMessageByRoomId
);
router.put(
  "/chatrooms/addMessage",
  checkConsultAdmin,
  adminController.addMessage
);
// users
module.exports = router;
