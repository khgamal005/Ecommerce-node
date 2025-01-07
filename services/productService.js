const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');
const ApiError = require('../utils/apiError');
const factory = require('./handlersFactory');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const { uploadMixOfImages } = require('../middlewares/uploadImageMiddleware');
const multer  = require('multer')
const multerStorage = multer.memoryStorage();

const multerFilter = function (req, file, cb) {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new ApiError('Only Images allowed', 400), false);
  }
};


exports.uploadProductImages = uploadMixOfImages([
    {
      name: 'imageCover',
      maxCount: 1,
    },
    {
      name: 'images',
      maxCount: 5,
    },
  ]);
  
exports.resizeProductImages = asyncHandler(async (req, res, next) => {
      // console.log(req.files);
  //1- Image processing for imageCover
  if (req.files.imageCover) {
    const imageCoverFileName = `product-${uuidv4()}-${Date.now()}-cover.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 95 })
      .toFile(`uploads/products/${imageCoverFileName}`);

    // Save image into our db
    req.body.imageCover = imageCoverFileName;
  }
  
  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (img, index) => {
        const imageName = `product-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;

        await sharp(img.buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 95 })
          .toFile(`uploads/products/${imageName}`);

        // Save image into our db
        req.body.images.push(imageName);
      })
    );

}
next();
})



exports.getProducts = factory.getAll(Product, 'Products');

// @desc    Get specific product by id
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProduct = factory.getOne(Product);

// @desc    Create product
// @route   POST  /api/v1/products
// @access  Private
exports.createProduct = factory.createOne(Product);

// @desc    Update specific Product
// @route   PUT /api/v1/product/:id
// @access  Private
exports.updateProduct = factory.updateOne(Product);

// @desc    Delete specific Product
// @route   DELETE /api/v1/categories/:id
// @access  Private
exports.deleteProduct = factory.deleteOne(Product);