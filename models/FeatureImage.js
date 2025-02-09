const mongoose = require("mongoose");

const FeatureImageSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true,
  },
  // Add other fields as necessary
}, { timestamps: true });

module.exports = mongoose.model("FeatureImage", FeatureImageSchema); 