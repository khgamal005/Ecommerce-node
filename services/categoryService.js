const { v4: uuidv4 } = require('uuid');
const Category = require('../models/categoryModel');
const factory = require('./handlersFactory');
const sharp = require('sharp');
const asyncHandler = require('express-async-handler');
const  {uploadSingleImage}  = require('../middlewares/uploadImageMiddleware');



// const multerstorage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, 'uploads/categories')
//     },
//     filename: function (req, file, cb) {
//         const ext=file.mimetype.split("/")[1]
//       const filename = `category-${uuidv4()}-${Date.now()}.${ext}`
//       cb(null, filename)
//     }
//   })

// const storage = multer.memoryStorage()
//   const multerFilter = function fileFilter (req, file, cb) {
//     if(file.mimetype.startsWith("image")){

//         cb(null, true)
//     }else{

//         cb(new Error("only images allowed"), true)
//     }
  
//   }
  
//   const upload = multer({ storage:storage ,fileFilter: multerFilter})
//   exports.uploadCategoryImage = upload.single('image');
exports.uploadCategoryImage = uploadSingleImage('image');


  exports.resizeImage = asyncHandler(async (req, res, next) => {
    const filename = `category-${uuidv4()}-${Date.now()}.jpeg`;
  
    if (req.file) {
      await sharp(req.file.buffer)
        .resize(600, 600)
        .toFormat('jpeg')
        .jpeg({ quality: 95 })
        .toFile(`uploads/categories/${filename}`);
  
      // Save image into our db
      req.body.image = filename;
    }
  
    next();
  });


exports.getCategories = factory.getAll(Category);

// @desc    Get specific category by id
// @route   GET /api/v1/categories/:id
// @access  Public
exports.getCategory = factory.getOne(Category);

// @desc    Create category
// @route   POST  /api/v1/categories
// @access  Private
exports.createCategory = factory.createOne(Category);

// @desc    Update specific category
// @route   PUT /api/v1/categories/:id
// @access  Private
exports.updateCategory = factory.updateOne(Category);

// @desc    Delete specific category
// @route   DELETE /api/v1/categories/:id
// @access  Private
exports.deleteCategory = factory.deleteOne(Category);
