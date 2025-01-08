const express = require("express");
const userController = require("../controllers/user");
const { query } = require("express-validator");
const User = require("../models/user");
const router = express.Router();

router.post(
  "/signup",
  [
    query("email", "Please enter a valid email")
      .normalizeEmail()
      .custom((value) => {
        return User.findOne({ email: value }).then((user) => {
          if (user) {
            return Promise.reject("This email address is already in use");
          }
        });
      }),
    query(
      "password",
      "Your passwords have to be numbers or/and text, and have at least 8 characters."
    )
      .trim()
      .isAlphanumeric()
      .isLength({ min: 8 }),
  ],
  userController.postSignup
);

router.post("/login", userController.postLogin);
router.get("/:userId", userController.getUser);
module.exports = router;
