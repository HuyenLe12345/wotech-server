const nodemailer = require("nodemailer");
const Product = require("../models/product");
const io = require("../socket");
// const brevoTransport = require("nodemailer-brevo-transport");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
});
console.log(process.env.GMAIL_USER);
const EmailTemplate = require("email-templates");
const convertMoney = require("../convertMoney");
const User = require("../models/user");
const Order = require("../models/order");

exports.postInfo = async (req, res) => {
  const { to, fullname, phone, address, idUser } = req.query;
  const user = await User.findById(idUser);
  if (user.email.toLowerCase() !== to.toLowerCase()) {
    return res.json({
      path: "email",
      error: "Your email doesnot match the email registered!",
    });
  }
  console.log(user.phone, phone);
  if (user.phone.toLowerCase() !== phone.toLowerCase()) {
    return res.json({
      path: "phone",
      error: "Your phone doesnot match the phone registered!",
    });
  }
  console.log("email and phone are oke");
  return res.status(200).json({ message: "Success" });
};
exports.postEmail = async (req, res) => {
  const { to, fullname, phone, address, idUser } = req.query;
  const user = await User.findById(idUser).populate("cart.items.productId");
  let sub_total = 0;
  console.log(user.cart.items);
  const products = user.cart.items.map((item) => {
    console.log("item", item);
    const productDoc = { ...item.productId };
    const product = productDoc._doc;
    console.log(product);
    const priceOfAproductByQuantity =
      parseInt(product.price) * parseInt(item.quantity);
    sub_total += priceOfAproductByQuantity;
    return {
      product: {
        _id: product._id,
        name: product.name,
        img: product.img1,
        price: product.price,
      },
      quantity: item.quantity,
    };
  });

  const order = new Order({
    products: products,
    user: {
      userId: user._id,
      address: address,
    },
    createdAt: new Date().toLocaleString(),
  });
  await order.save();
  // xử lí file pug để gắn vào html trong email
  const template = new EmailTemplate({
    views: { options: { extension: "pug" } },
  });
  try {
    const html = await template.render("./../views/email.pug", {
      fullname,
      phone,
      address,
      products,
      convertMoney,
      sub_total,
      createdAt: order.createdAt,
    });
    console.log("send Email");
    // cập nhật lại số lượng hàng sau khi order
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const productInStore = await Product.findById(product.product._id);
      const remainingQuantity =
        parseInt(productInStore.quantity) - parseInt(product.quantity);
      productInStore.quantity = remainingQuantity;
      await productInStore.save();
    }
    // cập nhật giỏ hàng về 0 sau khi place order
    user.cart.items = [];
    await user.save();
    // emit sản phẩm được đặt dể client and admin tự động cập nhật số lượng
    io.getIO().emit("update_quantity", { message: "update quantity" });

    return transporter.sendMail(
      {
        to: to,
        from: process.env.GMAIL_USER,
        subject: "Your Order",
        html: html,
      },
      (error, info) => {
        if (error) {
          return res.json({ error: "Failed to send email" });
        }
        console.log("Email sent successfully:", info.response);
      }
    );

    // return res.status(200).json({ message: "Email sent successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Failed to send email" });
  }
};
