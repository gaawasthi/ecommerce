import { Order } from '../models/Order.js';
import { TryCatch } from '../middlewares/TryCatch.js';
import { Product } from '../models/Product.js';


export const createOrder = TryCatch(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'login first — no seller found' });
  }

  const orderData = { ...req.body, user: userId };
  const items = orderData.items || [];

  const finalItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);

    if (!product) {
      return res.status(404).json({
        message: `Product not found: ${item.product}`,
      });
    }

    if (product.stock < item.quantity) {
      return res.status(400).json({
        message: `insufficient stock for product: ${product.name}`,
      });
    }


    product.stock -= item.quantity;
    await product.save();

    
    const mergedItem = {
      ...item,
      ...product.toObject(), 
      product: undefined      
    };

    finalItems.push(mergedItem);
  }

 
  orderData.items = finalItems;

  
  orderData.ordernumber =
    'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 10000);

  const order = new Order(orderData);
  await order.save();

  return res.status(201).json({
    message: 'Order placed successfully',
    order,
  });
});



export const getSellerProductOrder = TryCatch(async (req, res) => {
  const sellerId = req.user.id;

  const sellerProducts = await Product.find({ seller: sellerId }).select('_id');

  if (!sellerProducts.length) {
    return res.status(404).json({ message: 'No products found for this seller' });
  }

  const sellerProductIds = sellerProducts.map((p) => p._id);

  const orders = await Order.find({
    'items.product': { $in: sellerProductIds },
  })
    .populate('user', 'name email')
    .populate('items.product', 'name price description seller');

  res.status(200).json({
    success: true,
    count: orders.length,
    orders,
  });
});


export const userGetOrder = TryCatch(async (req, res) => {
  const userID = req.user.id;

  const orders = await Order.find({ user: userID });

  if (!orders.length) {
    return res.status(404).json({ message: 'no orders found' });
  }

  return res.status(200).json({
    messages: 'orders',
    count: orders.length,
    orders,
  });
});


export const userGetSingleOrder = TryCatch(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findById(id);

  if (!order) {
    return res.status(404).json({ message: 'no order found' });
  }

  return res.status(200).json({
    message: 'order detail',
    order,
  });
});


export const userCancelSingleOrder = TryCatch(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const order = await Order.findOne({
    _id: id,
    user: userId,
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'No orders found',
    });
  }

  if (['delivered', 'returned', 'cancelled'].includes(order.orderStatus)) {
    return res.status(400).json({
      success: false,
      message: `cannot cancel an order that is already ${order.orderStatus}`,
    });
  }

  order.orderStatus = 'cancelled';
  await order.save();

  return res.status(200).json({
    message: 'order cancelled',
    order,
  });
});


export const sellerUpdateOrder = TryCatch(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const sellerId = req.user.id;

  const validStatuses = [
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'returned',
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'invalid order status',
    });
  }

  const order = await Order.findById(id).populate(
    'items.product',
    'seller name'
  );

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  const sellerHasProduct = order.items.some(
    (item) => item.product && item.product.seller?.toString() === sellerId
  );

  if (!sellerHasProduct) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to update this order',
    });
  }

  order.orderStatus = status;
  await order.save();

  return res.status(200).json({
    success: true,
    message: `Order status updated to '${status}'`,
    order,
  });
});


export const allOrdersForAdmin = TryCatch(async (req, res) => {
  const orders = await Order.find();

  return res.status(200).json({
    message: 'orders',
    count: orders.length,
    orders,
  });
});
