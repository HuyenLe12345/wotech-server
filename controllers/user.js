const User = require("../models/user");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
exports.postSignup = (req, res) => {
  const { fullname, email, password, phone } = req.query;

  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = result.array()[0];
    console.log(errors);
    return res.json({ errors: errors });
  }
  return bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        fullname: fullname,
        email: email,
        password: hashedPassword,
        phone: phone,
        role: "client",
      });
      return user
        .save()
        .then(() => {
          res.status(200).json({ message: "Sign up successfully!" });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

exports.postLogin = async (req, res, next) => {
  const { email, password } = req.query;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.json({
        error: { path: "email", message: "This email address is incorrect" },
      });
    }
    const isMatching = await bcrypt.compare(password, user.password);
    if (!isMatching) {
      return res.json({
        error: { path: "password", message: "Your password are incorrect" },
      });
    }
    // req.session.isLoggedIn = true;
    // req.session.user = user;
    const token = jwt.sign(
      { email: user.email, userId: user._id.toString() },
      "supersupersecret",
      { expiresIn: "1h" }
    );
    return res.status(200).json({
      message: "Success",

      user: {
        fullname: user.fullname,
        _id: user._id.toString(),
        token: token,
      },
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.json({ error: "User not found" });
    }
    return res.status(201).json({ user: user });
  } catch (err) {
    console.log(err);
  }
};
