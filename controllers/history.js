const Order = require("../models/order");
const User = require("../models/user");
exports.getHistory = async (req, res, next) => {
  try {
    const { idUser } = req.query;
    const orderRaw = await Order.find({ "user.userId": idUser }).populate(
      "user.userId"
    );

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
    console.log(orders);
    return res.status(200).json({ order: orders });
  } catch (err) {
    console.log(err);
  }
};
exports.getDetail = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    console.log(orderId);
    const orderRaw = await Order.findById(orderId).populate("user.userId");
    console.log("raw", orderRaw);
    const user = {
      ...orderRaw.user.userId._doc,
      address: orderRaw.user.address,
    };
    console.log(user);
    const products = orderRaw.products;
    let total = 0;
    for (i = 0; i < products.length; i++) {
      const priceOfAproductByQuantity =
        parseInt(products[i].product.price) * parseInt(products[i].quantity);
      total += priceOfAproductByQuantity;
    }
    const order = {
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        phone: user.phone,
        address: user.address,
        total: total,
      },
      cart: products,
    };
    console.log(order);
    return res.status(200).json({ order: order });
  } catch (err) {
    console.log(err);
  }
};
