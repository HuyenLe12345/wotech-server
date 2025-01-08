const Product = require("../models/product");
exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find();

    return res.status(200).json({ products: products });
  } catch (err) {
    console.log(err);
  }
};
exports.getProductDetail = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error("Product not found");
    }
    return res.status(200).json({ product: product });
  } catch (err) {
    console.log(err);
  }
};
exports.getPagination = async (req, res) => {
  const { page, count, search, category } = req.query;
  console.log(req.query);
  let query = {};
  if (category !== "" && category.trim().toLowerCase() !== "all") {
    query.category = category.trim().toLowerCase();
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
      { price: { $regex: search } },
    ];
  }
  console.log(query);
  // Convert page and count to numbers
  const pageNumber = parseInt(page, 10);
  const countNumber = parseInt(count, 10);

  // Calculate the number of documents to skip
  const skip = (pageNumber - 1) * countNumber;
  try {
    const products = await Product.find(query)
      .skip(skip) // Skip the documents based on the current page
      .limit(countNumber); // Limit the number of documents returned

    const totalProducts = await Product.countDocuments(query); // Get total number of products matching the query

    return res.status(200).json({
      products: products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({ error: "Failed to fetch products" });
  }
};
