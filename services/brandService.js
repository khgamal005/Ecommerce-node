
const factory = require('./handlersFactory');
const { v4: uuidv4 } = require('uuid');

const Brand = require('../models/brandModel');
const  {uploadSingleImage}  = require('../middlewares/uploadImageMiddleware');
const sharp = require('sharp');
const asyncHandler = require('express-async-handler');

exports.uploadrandImage = uploadSingleImage('image');

  exports.resizeImage = asyncHandler(async (req, res, next) => {
    const filename = `brand-${uuidv4()}-${Date.now()}.jpeg`;
  
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat('jpeg')
      .jpeg({ quality: 95 })
      .toFile(`uploads/brands/${filename}`);
      req.body.image = filename;
  
    next();
  });


// @desc    Create brand
// @route   POST  /api/v1/brands
// @access  Private

exports.getBrands = factory.getAll(Brand);

// @desc    Get specific brand by id
// @route   GET /api/v1/brands/:id
// @access  Public
exports.getBrand = factory.getOne(Brand);

// @desc    Create brand
// @route   POST  /api/v1/brands
// @access  Private
exports.createBrand = factory.createOne(Brand);

// @desc    Update specific brand
// @route   PUT /api/v1/brands/:id
// @access  Private
exports.updateBrand = factory.updateOne(Brand);

// @desc    Delete specific brand
// @route   DELETE /api/v1/brands/:id
// @access  Private
exports.deleteBrand = factory.deleteOne(Brand);
