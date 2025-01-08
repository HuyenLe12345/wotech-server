const Product = require("../models/product");
const User = require("../models/user");
const Order = require("../models/order");
const Chat = require("../models/chat");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const io = require("../socket");
// login

exports.postLogin = async (req, res, next) => {
  const { email, password } = req.query;
  const errors = validationResult(req);
  console.log("errors", errors);
  if (!errors.isEmpty()) {
    return res.json({ error: errors.array()[0] });
  }
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.json({
        error: { path: "email", msg: "This email address is incorrect" },
      });
    }
    if (password.trim() === "") {
      return res.json({
        error: { path: "password", msg: "Please enter your password" },
      });
    }
    const isMatching = await bcrypt.compare(password, user.password);
    if (!isMatching) {
      return res.json({
        error: { path: "password", msg: "Your password are incorrect" },
      });
    }
    console.log("matchiing");
    if (user.role === "client" || user.role === "admin") {
      const token = jwt.sign(
        { email: user.email, userId: user._id.toString() },
        "supersupersecret",
        { expiresIn: "1h" }
      );
      console.log("token");
      return res.status(200).json({
        message: "Success",

        user: {
          fullname: user.fullname,
          _id: user._id.toString(),
          email: user.email,
          token: token,
        },
      });
    } else {
      return res.json({ msg: "You are not authorized" });
    }
  } catch (err) {
    console.log(err);
  }
};

// products

exports.postAddNewProduct = async (req, res) => {
  try {
    const { name, category, price, quantity, short_desc, long_desc } = req.body;
    const images = req.files;
    console.log(req.body, images);
    const newProduct = new Product({
      name: name,
      category: category.toLowerCase(),
      price: String(price),
      quantity: quantity,
      short_desc: short_desc,
      long_desc: long_desc,
      img1: images[0] ? images[0].path : "",
      img2: images[1] ? images[1].path : "",
      img3: images[2] ? images[2].path : "",
      img4: images[3] ? images[3].path : "",
      img5: images[4] ? images[4].path : "",
    });
    await newProduct.save();

    console.log("addnewProduct");
    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error });
  }
};
exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.productId;
    const { name, category, price, quantity, short_desc, long_desc } = req.body;
    console.log(req.body);
    const product = await Product.findById(productId);
    console.log(product);
    product.name = name;
    product.category = category.toLowerCase();
    product.price = String(price);
    product.short_desc = short_desc;
    product.long_desc = long_desc;
    product.quantity = quantity;

    await product.save();
    return res.status(200).json({ success: true });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: error });
  }
};
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new Error("Không tìm thấy sản phẩm theo id này");
  }
  await Product.findByIdAndDelete(id);
  return res.status(200).json({ message: "Xoá sản phẩm thành công" });
};
// history of latest orders
exports.getHistoryAll = async (req, res) => {
  try {
    const orderRaw = await Order.find().populate("user.userId");

    const orders = orderRaw.map((order) => {
      let total = 0;
      const products = order.products;
      for (i = 0; i < products.length; i++) {
        const priceOfAproductByQuantity =
          parseInt(products[i].product.price) * parseInt(products[i].quantity);
        total += priceOfAproductByQuantity;
      }
      const user = { ...order.user.userId._doc };
      return {
        _id: order._id,
        user: {
          _id: user._id,
          fullname: user.fullname,
          email: user.email,
          phone: user.phone,
          address: order.user.address,
        },
        total: total,
      };
    });
    const sortedOrders = orders.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    console.log(orders);
    return res.status(200).json({ orders: sortedOrders });
  } catch (err) {
    console.log(err);
  }
};
// chat room
exports.getAllRoom = async (req, res) => {
  try {
    const chatRoomsRaw = await Chat.find();
    const chatRooms = chatRoomsRaw.map((room) => {
      return { _id: room._id };
    });
    console.log(chatRooms);
    console.log("các rôm chats", chatRooms);
    return res.status(200).json({ rooms: chatRooms });
  } catch (error) {
    console.error("Error fetching chat rooms:", error);
  }
};

exports.addMessage = async (req, res) => {
  const { message, roomId, is_admin } = req.body;

  if (!roomId) {
    return res.status(400).json({ error: "Room ID is required" });
  }

  const chat = await Chat.findById(roomId);
  if (!chat) {
    return res.status(404).json({ error: "No room found" });
  }

  // Update conversation with new message
  const updatedConversation = chat.conversation;
  updatedConversation.push({ message, is_admin });
  chat.conversation = updatedConversation;
  await chat.save();

  // Emit the message to all clients in the room
  // io.getIO().to(roomId).emit("receive_message", { roomId: roomId });

  return res.status(200).json({ message: "Send message successfully" });
};

exports.getMessageByRoomId = async (req, res) => {
  const { roomId } = req.query;

  const chat = await Chat.findById(roomId);
  if (!chat) {
    throw new Error("No room found");
  }
  console.log("chat", chat.conversation);
  return res.status(200).json({ content: chat.conversation });
};

// get users by admin
exports.getAllUsers = async (req, res) => {
  const users = await User.find();
  return res.status(200).json({ users: users });
};
