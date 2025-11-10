import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'name cannot be empty'],
    minlength: [3, 'name must be at least 3 characters long'],
  },
  category: {
    type: String,
    required: [true, 'category cannot be empty'],
    minlength: [3, 'category must be at least 3 characters long'],
  },
  description: {
    type: String,
    required: [true, 'description cannot be empty'],
    minlength: [3, 'description must be at least 3 characters long'],
  },
  price: {
    type: Number,
    required: [true, 'price cannot be empty'],
  },
  brand: {
    type: String,
    trim: true
  },
  stock: {
    type: Number,
    required: [true, 'stock cannot be empty'],
    min: [0, "stock must be greater more than 1"]
  },
  color: {
    type: String,
    required: [true, 'color cannot be empty'],
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'seller is required'],
  }
},
{ timestamps: true });

export const Product = mongoose.model('Product', ProductSchema);