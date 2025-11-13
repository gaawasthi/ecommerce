import { TryCatch } from '../middlewares/TryCatch.js';
import { Order } from '../models/Order.js';
import User from '../models/User.js';

// order added last week
// customer added last week
//-------------admin
// top sellers
// top product
// top custommers
// total revenue
// customer list
// seller list
// total oders
// order by stauts
//pending // delivered

export const totalRevenue = TryCatch(async (req, res) => {
  const adminID = req.user?.id;

  if (!adminID) {
    return res.status(401).json({
      message: 'Unauthorized',
    });
  }

  const deliverdOrders = await Order.find({
    orderStatus: 'delivered',
  }).populate({
    path: 'items.product',
    select: 'price',
  });

  const allItems = deliverdOrders.flatMap((order) => order.items);
  const totalRevenue = allItems.reduce((sum, item) => {
    return sum + item.product.price * item.quantity;
  }, 0);

  res.status(200).json({ totalRevenue });
});

export const lastWeekData = TryCatch(async (req, res) => {
  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);

  //order last week
  const ordersLastWeek = await Order.countDocuments({
    createdAt: { $gte: lastWeek },
  });
  // customerLastWeek

  const customerLastWeek = await User.countDocuments({
    role: 'customer',
    createdAt: { $gte: lastWeek },
  });
  // seller last week

  const sellerLastWeek = await User.countDocuments({
    role: 'seller',
    createdAt: { $gte: lastWeek },
  });
  return res.status(200).json({
    ordersLastWeek,
    customerLastWeek,
    sellerLastWeek,
  });
});

// top customer

export const topCustomers = TryCatch(async (req, res) => {
  const orders = await Order.find({ orderStatus: 'delivered' }).populate('user', 'firstName lastName');

  const customerCount = {};

  orders.forEach((order) => {
    if (order.user?._id) {
      const userId = order.user._id.toString();
      if (!customerCount[userId]) {
        customerCount[userId] = {
          count: 0,
          firstName: order.user.firstName,
          lastName: order.user.lastName,
        };
      }
      customerCount[userId].count += 1;
    }
  });

  const sortedCustomers = Object.entries(customerCount)
    .map(([userId, data]) => ({
      userId,
      firstName: data.firstName,
      lastName: data.lastName,
      count: data.count,
    }))
    .sort((a, b) => b.count - a.count);

  return res.status(200).json({
    success: true,
    topCustomers: sortedCustomers,
  });
});

export const topProducts = TryCatch(async (req, res) => {
  const orders = await Order.find({ orderStatus: 'delivered' }).populate(
    'items.product',
    'name price'
  );

  const productCount = {};

  orders.forEach((order) => {
    order.items?.forEach((item) => {
      const product = item.product;
      const productId = product?._id?.toString();

      if (productId) {
        if (!productCount[productId]) {
          productCount[productId] = {
            count: 0,
            name: product.name,
          };
        }
        productCount[productId].count += item.quantity || 1;
      }
    });
  });

  const sortedProducts = Object.entries(productCount)
    .map(([productId, data]) => ({
      productId,
      name: data.name,
      count: data.count,
    }))
    .sort((a, b) => b.count - a.count);

  return res.status(200).json({
    success: true,
    topProducts: sortedProducts,
  });
});

export const topSellers = TryCatch(async (req, res) => {
  const orders = await Order.find({ orderStatus: 'delivered' }).populate({
    path: 'items.product',
    populate: {
      path: 'seller',
      select: 'firstName lastName',
    },
  });

  const sellerSales = {};

  orders.forEach((order) => {
    order.items?.forEach((item) => {
      const product = item.product;
      const seller = product?.seller;
      const sellerId = seller?._id?.toString();

      if (sellerId) {
        const quantity = item.quantity || 1;
        const revenue = product.price ? product.price * quantity : 0;

        if (!sellerSales[sellerId]) {
          sellerSales[sellerId] = {
            totalSold: 0,
            totalRevenue: 0,
            firstName: seller.firstName,
            lastName: seller.lastName,
          };
        }

        sellerSales[sellerId].totalSold += quantity;
        sellerSales[sellerId].totalRevenue += revenue;
      }
    });
  });

  const sortedSellers = Object.entries(sellerSales)
    .map(([sellerId, data]) => ({
      sellerId,
      firstName: data.firstName,
      lastName: data.lastName,
      totalSold: data.totalSold,
      totalRevenue: data.totalRevenue,
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue);

  return res.status(200).json({
    success: true,
    topSellers: sortedSellers,
  });
});
