import { handleUpload } from '../config/claudinary.js';
import { TryCatch } from '../middlewares/TryCatch.js';
import { Product } from '../models/Product.js';
import  User  from '../models/User.js';
import {Order} from '../models/Order.js'



// seller operations
// add product via seller
export const addProduct = TryCatch(async (req, res) => {
 let uploadedImages = [];

if (req.files?.length) {
  uploadedImages = await Promise.all(
    req.files.map(async (file) => {
      const b64 = Buffer.from(file.buffer).toString('base64');
      const dataURI = `data:${file.mimetype};base64,${b64}`;
      const cloudRes = await handleUpload(dataURI);
      return {
        public_id: cloudRes.public_id,
        url: cloudRes.secure_url,
      };
    })
  );
}
  const productData = {
    ...req.body,
    seller: req.user.id,
    images : uploadedImages,
  };

  const product = new Product(productData);
  await product.save();

  return res.status(201).json({
    message: 'product created successfully',
    product,
  });
});

 // get selles gets his own product
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

// update product admin + seller
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


  
// export const sellerAnalytics = TryCatch(async (req, res) => {
//   const sellerId = req.user.id;


//   const totalProducts = await Product.countDocuments({ seller: sellerId });


//   const lowStockProducts = await Product.find({
//     seller: sellerId,
//     stock: { $lte: 5 }, // gte greate // lte leseer
//   }).select("name stock");


//   const recentOrders = await Order.find({ "items.seller": sellerId })
//     .sort({ createdAt: -1 })
//     .limit(5)
//     .populate("items.product", "name price")
//     .lean();

//   // const topProducts = await Order.aggregate([
//   //   { $unwind: "$items" }, // 
//   //   { $match: { "items.seller": sellerId } }, // matc karega
//   //   {
//   //     $group: {
//   //       _id: "$items.product",
//   //       totalSold: { $sum: "$items.quantity" },
//   //       totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
//   //     },
//   //   },
//   //   {
//   //     $lookup: {
//   //       from: "products",
//   //       localField: "_id",
//   //       foreignField: "_id",
//   //       as: "product",
//   //     },
//   //   },
//   //   { $unwind: "$product" },
//   //   { $sort: { totalSold: -1 } },
//   //   { $limit: 5 },
//   //   {
//   //     $project: {
//   //       _id: 0,
//   //       productId: "$product._id",
//   //       name: "$product.name",
//   //       totalSold: 1,
//   //       totalRevenue: 1,
//   //     },
//   //   },
//   // ]);


//   res.status(200).json({
//     success: true,
//     data: {
//       totalProducts,
//       lowStockCount: lowStockProducts.length,
//       lowStockProducts,
//       recentOrders,
//       // topProducts,
//     },
//   });
// });


 // customer operations
// get single product // for everyone
// get all products // for every one
export const getProducts = TryCatch(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  const {
    search,        
    category,      
    minPrice,      
    maxPrice,      
    sortBy,        
    sortOrder,    
  } = req.query;

 
  const query = {};

 
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },      
      { description: { $regex: search, $options: 'i' } },
    ];
  }

 
  if (category) {
    query.category = category;
  }

 
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }


  let sort = {};
  if (sortBy) {
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
  } else {
    sort = { createdAt: -1 }; 
  }

  const products = await Product.find(query)
    .populate('seller', 'firstName lastName email')
    .sort(sort)
    .skip(offset)
    .limit(limit);

  const totalProduct = await Product.countDocuments(query);
  const totalPages = Math.ceil(totalProduct / limit);

  res.status(200).json({
    message: 'Product list retrieved successfully',
    page,
    limit,
    totalProduct,
    totalPages,
    products,
  });
});

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



