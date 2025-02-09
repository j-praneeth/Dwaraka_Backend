const Feature = require("../../models/Feature");
const FeatureImage = require("../../models/FeatureImage");

const addFeatureImage = async (req, res) => {
  try {
    const { image } = req.body;

    console.log(image, "image");

    const featureImages = new Feature({
      image,
    });

    await featureImages.save();

    res.status(201).json({
      success: true,
      data: featureImages,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getFeatureImages = async (req, res) => {
  try {
    const images = await Feature.find({});

    res.status(200).json({
      success: true,
      data: images,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const deleteFeatureImage = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedImage = await FeatureImage.findByIdAndDelete(id);

    if (!deletedImage) {
      return res.status(404).json({
        success: false,
        message: "Feature image not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Feature image deleted successfully",
      data: deletedImage,
    });
  } catch (error) {
    console.error('Error deleting feature image:', error);
    res.status(500).json({
      success: false,
      message: "Failed to delete feature image",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

module.exports = { addFeatureImage, getFeatureImages, deleteFeatureImage };
