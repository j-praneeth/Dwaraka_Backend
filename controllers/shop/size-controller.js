const Product = require("../../models/Product");

const getSizesByCategory = async (req, res) => {
  const { category, productId } = req.params;

  const sizeOptions = {
    Silk: ["Free Size"],
    Handloom: ["Free Size"],
    CottonSarees: ["Free Size"],
    Fancy: ["Free Size"],
    Tops: ["M", "L", "XL", "XXL"],
  };

  const sizes = sizeOptions[category.toLowerCase()] || [];

  // If a product ID is provided, fetch the product to get its existing sizes
  if (productId) {
    try {
      const product = await Product.findById(productId);
      if (product) {
        // Return the existing sizes for the product
        return res.status(200).json({
          success: true,
          sizes: product.sizes.length > 0 ? product.sizes : sizes, // Return existing sizes or default sizes
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "Product not found.",
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error fetching product sizes.",
      });
    }
  }

  res.status(200).json({
    success: true,
    sizes,
  });
};

module.exports = {
  getSizesByCategory,
}; 