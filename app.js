const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
require("dotenv").config();
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const cors = require("cors");
const User = require("./models/user");

const app = express();
const userRouter = require("./routes/user");
const productRouter = require("./routes/product");
const cartRouter = require("./routes/cart");
const orderRouter = require("./routes/order");
const historyRouter = require("./routes/history");
const chatRouter = require("./routes/chat");
const adminRouter = require("./routes/admin");
const MONGO_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.u5txi.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}`;
const store = new MongoDBStore({
  uri: MONGO_URI,
  collection: "sessions",
});

app.use(
  session({
    secret: "assignment-3-secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, file.filename + "-" + file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else cb(null, false);
};
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(multer({ storage: storage, fileFilter: fileFilter }).array("image", 5));

app.set("view engine", "pug");
app.set("views", "views");
app.use("/users", userRouter);
app.use("/products", productRouter);
app.use("/carts", cartRouter);
app.use("/order", orderRouter);
app.use("/history", historyRouter);
app.use("/chatrooms", chatRouter);
app.use("/admin", adminRouter);

mongoose
  .connect(MONGO_URI)
  .then((result) => {
    const server = app.listen(5000);
    const io = require("./socket").init(server);
    io.on("connection", (socket) => {
      console.log(`${socket.id} connected`);
      socket.on("send_message", ({ roomId, message, is_admin }) => {
        console.log(
          `Message from the person who ${
            is_admin ? "is admin" : "is client"
          } received in room ${roomId}: ${message} `
        );
        if (!is_admin) {
          io.to(roomId).emit("new-message", {
            roomId: roomId,
            is_admin: is_admin,
          });
        }

        socket.join(roomId);
        io.to(roomId).emit("receive_message", {
          roomId: roomId,
          is_admin: is_admin,
        });
      });
    });
  })
  .catch((err) => {
    console.log(err);
  });
