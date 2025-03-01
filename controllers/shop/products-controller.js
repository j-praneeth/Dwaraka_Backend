const Product = require("../../models/Product");

const getFilteredProducts = async (req, res) => {
  try {
    const { category = [], brand = [], sortBy = "price-lowtohigh" } = req.query;

    let filters = {};

    if (category.length) {
      filters.category = { $in: category.split(",") };
    }

    if (brand.length) {
      filters.brand = { $in: brand.split(",") };
    }

    let sort = {};

    switch (sortBy) {
      case "price-lowtohigh":
        sort.price = 1;

        break;
      case "price-hightolow":
        sort.price = -1;

        break;
      case "title-atoz":
        sort.title = 1;

        break;

      case "title-ztoa":
        sort.title = -1;

        break;

      default:
        sort.price = 1;
        break;
    }

    const products = await Product.find(filters).sort(sort);

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (e) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

const getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product)
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (e) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

const getProductsByCategory = async (req, res) => {
  const { category } = req.params;

  try {
    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category parameter is required"
      });
    }

    // Decode the URL-encoded category name
    const decodedCategory = decodeURIComponent(category);
    console.log(`Searching for products in category: ${decodedCategory}`);

    // Create a case-insensitive query that matches the category name exactly
    const products = await Product.find({
      category: new RegExp(`^${decodedCategory}$`, 'i')
    });

    console.log(`Found ${products.length} products in category: ${decodedCategory}`);

    if (!products || products.length === 0) {
      console.log(`No products found in category: ${decodedCategory}`);
      return res.status(404).json({
        success: false,
        message: `No products found in category: ${decodedCategory}`
      });
    }

    res.status(200).json({
      success: true,
      data: products,
      count: products.length
    });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message
    });
  }
};

module.exports = { getFilteredProducts, getProductDetails, getProductsByCategory };