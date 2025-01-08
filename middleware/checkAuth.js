const jwt = require("jsonwebtoken");
const User = require("../models/user");
// kiểm tra xem người dùng đã đăng nhập chưa? Có thể là admin, consultant và client
exports.checkAuth = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    return res.status(401).send("Not authenticated");
  }

  const token = authHeader.split(" ")[1];

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, "supersupersecret");
  } catch (err) {
    console.log(err);
  }
  if (!decodedToken) {
    return res.status(401).send("Not authenticated");
  }

  req.userId = decodedToken.userId;
  next();
};
//kiểm tra xem người dùng đã đăng nhập có phải là client và admin không?
exports.checkConsultAdmin = async (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    return res.status(401).send("Not authenticated");
  }

  const token = authHeader.split(" ")[1];

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, "supersupersecret");
  } catch (err) {
    console.log(err);
  }
  if (!decodedToken) {
    return res.status(401).send("Not authenticated");
  }
  const user = await User.findById(decodedToken.userId);
  if (user.role === "client" || user.role === "admin") {
    req.userId = decodedToken.userId;
    return next();
  }
  return res.json({ message: "You are not authorized" });
};
//kiểm tra xem người đăng nhập có phải là admin không?
exports.checkAdmin = async (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    return res.status(401).send("Not authenticated");
  }

  const token = authHeader.split(" ")[1];

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, "supersupersecret");
  } catch (err) {
    console.log(err);
  }
  if (!decodedToken) {
    return res.status(401).send("Not authenticated");
  }
  const user = await User.findById(decodedToken.userId);
  if (user.role === "admin") {
    req.userId = decodedToken.userId;
    return next();
  }
  return res.json({ message: "You are not authorized" });
};
