const Product = require("../models/product");
const User = require("../models/user");
exports.postAddToCart = async (req, res) => {
  try {
    console.log("query");
    const { idUser, _id, quantity } = req.query;
    console.log("add to cart");
    const user = await User.findById(idUser);
    const product = await Product.findById(_id);
    const updatedCart = user.cart;
    console.log("updatedCart");
    if (updatedCart.items.length === 0) {
      updatedCart.items.push({
        productId: product._id,
        quantity: parseInt(quantity),
      });
    } else if (updatedCart.items.length > 0) {
      const productIndex = updatedCart.items.findIndex(
        (prod) => prod.productId.toString() === _id.toString()
      );
      if (productIndex >= 0) {
        const oldQuantity = updatedCart.items[productIndex].quantity;
        const newQuantity = parseInt(oldQuantity) + parseInt(quantity);
        updatedCart.items[productIndex].quantity = newQuantity;
      } else {
        updatedCart.items.push({
          productId: _id,
          quantity: parseInt(quantity),
        });
      }
    }
    user.cart = updatedCart;
    await user.save();
    return res.status(200).json({ message: "Success" });
  } catch (err) {
    console.log(err);
  }
};
exports.getCarts = async (req, res) => {
  const { idUser } = req.query;
  const user = await User.findById(idUser).populate("cart.items.productId");

  const cart = user.cart.items.map((value) => {
    return {
      ...value.productId._doc,
      quantity: value.quantity,
      idUser: user._id,
    };
  });

  console.log("cart", cart);
  return res.status(200).json({ cart: cart });
};

exports.putToCart = async (req, res) => {
  try {
    const { idUser, _id, quantity } = req.query;
    console.log(req.query);
    const user = await User.findById(idUser);
    const updatedCart = user.cart;
    const productIndex = updatedCart.items.findIndex(
      (prod) => prod.productId.toString() === _id.toString()
    );
    //lấy count mới sau khi tăng / giảm
    const newQuantity = parseInt(quantity);
    // update quantity cho sản phẩm
    updatedCart.items[productIndex].quantity = newQuantity;
    user.cart = updatedCart;
    await user.save();
    return res.status(200).json({ message: "Success" });
  } catch (err) {
    console.log(err);
  }
};
exports.deleteCart = async (req, res) => {
  try {
    const { idUser, _id } = req.query;
    const user = await User.findById(idUser);
    const updatedCart = user.cart;

    const updatedItems = updatedCart.items.filter(
      (prod) => prod.productId.toString() !== _id.toString()
    );
    user.cart.items = updatedItems;
    await user.save();
    return res.status(200).json({ message: "Success" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Failed to delete item from cart" });
  }
};
exports.postCheckNumberOfProduct = async (req, res) => {
  const id = req.body.id;
  const user = await User.findById(id);
  const items = user.cart.items;
  for (let i = 0; i < items.length; i++) {
    const product = await Product.findById(items[i].productId);
    if (Number(items[i].quantity) > Number(product.quantity)) {
      return res.json({
        success: false,
        message: `Hiện tại, số lượng còn lại của sản phẩm "${product.name}" là ${product.quantity}, không đủ cho đơn hàng của bạn.`,
      });
    }
  }
  return res.status(200).json({ success: true });
};
