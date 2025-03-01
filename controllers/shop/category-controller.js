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
    const createdCategories = [];
    const existingCategories = [];

    for (const categoryName of defaultCategories) {
      if (typeof categoryName !== 'string' || !categoryName.trim()) {
        console.error(`Invalid category name: ${categoryName}`);
        continue;
      }

      const trimmedName = categoryName.trim();
      const escapedName = trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      console.log(`Checking for category: ${trimmedName}`);

      try {
        const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${escapedName}$`, 'i') } });
        if (!existingCategory) {
          const newCategory = new Category({ name: trimmedName });
          await newCategory.save();
          createdCategories.push(trimmedName);
          console.log(`Created category: ${trimmedName}`);
        } else {
          existingCategories.push(trimmedName);
          console.log(`Category already exists: ${trimmedName}`);
        }
      } catch (categoryError) {
        console.error(`Error processing category ${trimmedName}:`, categoryError);
      }
    }

    res.status(200).json({
      success: true,
      message: "Default categories processed",
      created: createdCategories,
      existing: existingCategories
    });
  } catch (error) {
    console.error('Error creating categories:', error);
    res.status(500).json({ success: false, message: "Failed to create categories", error: error.message });
  }
};

module.exports = {
  fetchCategories,
  createDefaultCategories,
};