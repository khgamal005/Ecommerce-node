const slugify = require('slugify');
const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');
const ApiError = require('../utils/apiError');

const ApiFeatures = require('../utils/apiFeatures');


exports.getProducts = asyncHandler(async (req, res) => {
  const apifeature =new ApiFeatures(Product.find() ,req.query).filter().search().sort().paginate().limitFields().search()

  const Products= await apifeature.mongooseQuery


  res.status(200).json({ results: Products.length, data: Products });
});

exports.getProduct = asyncHandler(async (req, res,next) => {
  const { id } = req.params;
  const Products = await Product.findById(id).populate({ path: 'category', select: 'name -_id'});
  if (!Product) {
    return next(new ApiError(`No Product for this id ${id}`, 404));

  }
  res.status(200).json({ data: Products });
});
// @desc    Create product
// @route   POST  /api/v1/products
// @access  Private

exports.createProduct = asyncHandler(async (req, res) => {
  const {name} = req.body;//-

  const Products = await Product.create({ ...req.body });//-

  res.status(201).json({ data: Products });
});

// @desc    Update specific Product
// @route   PUT /api/v1/product/:id
// @access  Private
exports.updateProduct = asyncHandler(async (req, res,next) => {
  const { id } = req.params;
  if(req.body.title){
    
    req.body.slug=slugify(req.body.title)
  }
   const { ...reqbody} = req.body;

  const Products = await Product.findByIdAndUpdate({_id:id},reqbody,{new:true});

  if (!Products) {
    return next(new ApiError(`No Product for this id ${id}`, 404));
  }
  res.status(200).json({ data: Products });
});

// @desc    Delete specific Product
// @route   DELETE /api/v1/categories/:id
// @access  Private
exports.deleteProduct = asyncHandler(async (req, res,next) => {
  const { id } = req.params;
  const Products = await Product.findByIdAndDelete(id);

  if (!Product) {
    return next(new ApiError(`No category for this id ${id}`, 404));
  }
  res.status(204).send();
});
