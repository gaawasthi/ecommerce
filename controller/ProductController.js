import { TryCatch } from '../middlewares/TryCatch.js';
import { Product } from '../models/Product.js';

// add product via seller
export const addProduct = TryCatch(async (req, res) => {
  const productData = {
    ...req.body,
    seller: req.user.id,
  };

  const product = new Product(productData);
  await product.save();

  return res.status(201).json({
    message: 'product created successfully',
    product,
  });
});

// get all products // for every one
export const getProducts = TryCatch(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  // leftover data // skipped one
  const offset = (page - 1) * limit;

  const product = await Product.find()
    .populate('seller', 'firstName lastName email') /// add this data in result
    .skip(offset)
    .limit(limit);

  const totalProduct = await Product.countDocuments(); // couunt total products
  const totalPages = Math.ceil(totalProduct / limit);

  res.status(200).json({
    message: 'product data',
    page,
    limit,
    totalProduct,
    totalPages,
    product,
  });
});

// get single product // for everyone
export const getSingleProduct = TryCatch(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id).populate(
    'seller',
    'firstName lastName email phone'
  );

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  return res.status(200).json({
    message: 'Product found successfully',
    product,
  });
});

// seller /// seller get its own product
export const getMyProducts = TryCatch(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  const products = await Product.find({ seller: req.user.id })
    .skip(offset)
    .limit(limit);

  const totalProduct = await Product.countDocuments({ seller: req.user.id });
  const totalPages = Math.ceil(totalProduct / limit);

  res.status(200).json({
    message: 'Your products',
    page,
    limit,
    totalProduct,
    totalPages,
    products,
  });
});

// delete product // only admin and seller can delete it

export const deleteProduct = TryCatch(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  await Product.findByIdAndDelete(id);
  return res.status(200).json({
    message: 'Product deleted successfully',
    product,
  });
});
// admin and seller ucan update
export const updateProduct = TryCatch(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);

  if (!product) {
    return res.status(404).json({ message: 'product not found' });
  }

  const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  return res.status(200).json({
    message: 'product updated successfully',
    product: updatedProduct,
  });
});

// admin and seller can update
export const patchProduct = TryCatch(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);

  if (!product) {
    return res.status(404).json({ message: 'product not found' });
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    id,
    { $set: req.body },
    { new: true, runValidators: true }
  );

  return res.status(200).json({
    message: 'Product detail changed',
    product: updatedProduct,
  });
});
