const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    image: String,
    title: String,
    description: String,
    category: String,
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    brand: String,
    price: Number,
    salePrice: Number,
    totalStock: Number,
    averageReview: Number,
    sizes: { type: [String], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
