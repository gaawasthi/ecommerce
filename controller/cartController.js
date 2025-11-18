import { Product } from '../models/Product.js';
import { Cart } from '../models/Cart.js';
import { TryCatch } from '../middlewares/TryCatch.js';
import mongoose from 'mongoose';

export const addToCart = TryCatch(async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity = 1 } = req.body;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: 'Invalid product ID' });
  }

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  if (product.stock < quantity) {
    return res.status(400).json({
      message: 'Insufficient stock',
      available: product.stock,
    });
  }

  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = new Cart({ user: userId, items: [] });

  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId.toString()
  );

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;
    if (newQuantity > product.stock) {
      return res.status(400).json({
        message: `Only ${product.stock} items in stock`,
      });
    }
    existingItem.quantity = newQuantity;
  } else {
    cart.items.push({
      product: productId,
      quantity,
      price: product.price,
    });
  }

  cart.calculatePrices();
  await cart.save();

  res.status(200).json({ message: 'Item added to cart', cart });
});

export const getCart = TryCatch(async (req, res) => {
  const userId = req.user.id;

  const cart = await Cart.findOne({ user: userId }).populate('items.product');

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({
      message: 'your cart is empty',
    });
  }

  return res.status(200).json({
    message: 'your cart',
    cart,
  });
});

export const updateCartItems = TryCatch(async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity = 1 } = req.body;

  const cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart) {
    return res.status(400).json({ message: 'cart not found' });
  }

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  if (quantity > product.stock) {
    return res.status(400).json({ message: 'not enough stock' });
  }

  const index = cart.items.findIndex(
    (i) => i.product._id.toString() === productId.toString()
  );

  if (index === -1) {
    return res.status(400).json({ message: 'no products in cart' });
  }

  if (quantity <= 0) {
    cart.items.splice(index, 1);
  } else {
    cart.items[index].quantity = quantity;
  }

  cart.calculatePrices();
  await cart.save();

  return res.status(200).json({
    message: 'cart updated successfully',
    cart,
  });
});

export const removeAnItem = TryCatch(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const cart = await Cart.findOneAndUpdate(
    { user: userId },
    { $pull: { items: { product: id } } },
    { new: true }
  ).populate('items.product');

  if (!cart) {
    return res.status(400).json({ message: 'cart not found' });
  }

  cart.calculatePrices();
  await cart.save();

  return res.status(200).json({
    message: 'removed from cart',
    cart,
  });
});

// clear cart

export const clearCart = TryCatch(async (req, res) => {
  const userId = req.user.id;
  const cart = await Cart.findOneAndUpdate(
    { user: userId },
    {
      $set: {
        items: [],
        itemsPrice: 0,
        totalPrice: 0,
      },
    },
    { new: true }
  );

  return res.status(200).json({
    message: 'cart is empty now',
    cart,
  });
});
