const { imageUploadUtil } = require("../../helpers/cloudinary");
const Product = require("../../models/Product");
const Category = require("../../models/Category"); // ✅ Add this line


const handleImageUpload = async (req, res) => {
  try {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const url = "data:" + req.file.mimetype + ";base64," + b64;
    const result = await imageUploadUtil(url);

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error occured",
    });
  }
};

//add a new product
const addProduct = async (req, res) => {
  try {
    const {
      image,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      totalStock,
      averageReview,
      sizes,
    } = req.body;

    if (!category) {
      return res.status(400).json({ success: false, message: "Category is required" });
    }

    const categoryData = await Category.findById(category);
    if (!categoryData) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const newlyCreatedProduct = new Product({
      image,
      title,
      description,
      category: categoryData.name,
      categoryId: category,
      brand,
      price,
      salePrice,
      totalStock,
      averageReview,
      sizes: sizes || [],
    });

    await newlyCreatedProduct.save();
    res.status(201).json({
      success: true,
      data: newlyCreatedProduct,
    });
  } catch (e) {
    console.error("Error adding product:", e);
    res.status(500).json({
      success: false,
      message: "Error occurred while adding product",
      error: e.message,
    });
  }
};

const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      image,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      totalStock,
      averageReview,
      sizes,
    } = req.body;

    let findProduct = await Product.findById(id);
    if (!findProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const categoryData = await Category.findById(category);
    if (!categoryData) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        image,
        title,
        description,
        category: categoryData.name,
        categoryId: category,
        brand,
        price,
        salePrice,
        totalStock,
        averageReview,
        sizes: sizes || [],
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updatedProduct,
    });
  } catch (e) {
    console.error("Error editing product:", e);
    res.status(500).json({
      success: false,
      message: "Error occurred while editing product",
      error: e.message,
    });
  }
};

//fetch all products

const fetchAllProducts = async (req, res) => {
  try {
    const listOfProducts = await Product.find({});
    res.status(200).json({
      success: true,
      data: listOfProducts,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

//delete a product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product)
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });

    res.status(200).json({
      success: true,
      message: "Product delete successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error occured",
    });
  }
};

module.exports = {
  handleImageUpload,
  addProduct,
  fetchAllProducts,
  editProduct,
  deleteProduct,
};
