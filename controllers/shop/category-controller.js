const Category = require("../../models/Category");

const fetchCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: "Failed to fetch categories" });
  }
};

const createDefaultCategories = async (req, res) => {
  const defaultCategories = ["All Categories", "Silk", "Handlooms", "Cotton Sarees", "Tops", "Fancy"];

  try {
    for (const categoryName of defaultCategories) {
      console.log(`Checking for category: ${categoryName}`);
      const existingCategory = await Category.findOne({ name: categoryName });
      if (!existingCategory) {
        const newCategory = new Category({ name: categoryName });
        await newCategory.save();
        console.log(`Created category: ${categoryName}`);
      } else {
        console.log(`Category already exists: ${categoryName}`);
      }
    }
    
    if (res) {
      res.status(200).json({ success: true, message: "Default categories ensured" });
    }
    return { success: true, message: "Default categories ensured" };
  } catch (error) {
    console.error('Error creating categories:', error);
    if (res) {
      res.status(500).json({ success: false, message: "Failed to create categories", error: error.message });
    }
    throw error;
  }
};

module.exports = {
  fetchCategories,
  createDefaultCategories,
};