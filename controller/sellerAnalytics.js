import { TryCatch } from '../middlewares/TryCatch.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';

// best saling product
// low stock product
// product listing
// pending orders
// deliverd orders
// last week order 


//total revenue
export const totalRevenueSeller = TryCatch(async (req, res) => {
  const sellerID = req.user?.id;
  if (!sellerID) {
    return res.status(401).json({ message: 'Unauthorized' });
  }


  const sellerProducts = await Product.find({ seller: sellerID }).select('_id');
  const sellerProductIds = sellerProducts.map((p) => p._id);

  if (sellerProductIds.length === 0) {
    return res.status(200).json({ totalRevenue: 0 });
  }


  const deliveredOrders = await Order.find({
    orderStatus: 'delivered',
    'items.product': { $in: sellerProductIds },
  }).populate({
    path: 'items.product',
    select: 'price',
  });


  const allItems = deliveredOrders.flatMap((order) => order.items);
  const sellerItems = allItems.filter((item) => {
   
    return sellerProductIds.some((id) => id.equals(item.product._id));
  });


  const totalRevenue = sellerItems.reduce((sum, item) => {
    return sum + item.product.price * item.quantity;
  }, 0);

  res.status(200).json({ totalRevenue });
});

//low stock product

export const lowStockProducts = TryCatch(async (req, res) => {
  const sellerId = req.user?.id;

  const lowStockProducts = await Product.find({
    seller: sellerId,
    stock: { $lte: 5 },
  }).select('name stock');

  return res.status(200).json({
    message: 'low stock products ',
    lowStockProducts,
  });
});

// pending orders

export const pendingOrders = TryCatch(async (req, res) => {
  const sellerId = req.user?.id;

  const sellerProducts = await Product.find({
    seller: sellerId,
  }).select('_id');

  const sellerProductIds = sellerProducts.map((p) => p._id);

  const pendingOrders = await Order.find({
    orderStatus: 'confirmed',
    'items.product': { $in: sellerProductIds },
  })
    .populate({
      path: 'user',
      select: 'name email',
    })
    .populate({
      path: 'items.product',
      select: 'name price',
    });
   
   return res.status(200).json({
    pendingOrders
   })
});
 //deliverd orders
export const deliverdOrders = TryCatch(async (req, res) => {
  const sellerId = req.user?.id;

  const sellerProducts = await Product.find({
    seller: sellerId,
  }).select('_id');

  const sellerProductIds = sellerProducts.map((p) => p._id);

  const delivered = await Order.find({
    orderStatus: 'confirmed',
    'items.product': { $in: sellerProductIds },
  })
    .populate({
      path: 'user',
      select: 'name email',
    })
    .populate({
      path: 'items.product',
      select: 'name price',
    });

    return res.status(200).json({
        delivered
    })
});