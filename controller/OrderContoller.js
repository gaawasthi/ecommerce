import { Order } from '../models/Order.js';
import { TryCatch } from '../middlewares/TryCatch.js';
import { Product } from '../models/Product.js';

// create order
export const createOrder = TryCatch(async (req, res) => {
  const userId = req.user.id;
  const orderData = {
    ...req.body,
    user: userId,
  };
  if (!userId) {
    res.status(401).json({
      message: 'login first no user founded', 
    });
  }
  const order = new Order(orderData);
  await order.save();

  return res.status(201).json({
    message: 'order placed successfully',
    order,
  });
});
// seller geting order details of there products

export const getSellerProductOrder = TryCatch(async (req, res) => {
  const sellerId = req.user.id;

  const sellerProducts = await Product.find({ seller: sellerId }).select('_id');

  if (!sellerProducts || sellerProducts.length === 0) {
    return res
      .status(404)
      .json({ message: 'No products found for this seller' });
  }

  const sellerProductIds = sellerProducts.map((p) => p._id);

  const orders = await Order.find({
    'items.product': { $in: sellerProductIds },
  })
    .populate({
      path: 'user',
      select: 'name email',
    })
    .populate({
      path: 'items.product',
      select: 'name price description seller',
    });
  res.status(200).json({
    success: true,
    count: orders.length,
    orders: orders,
  });
});

//user see his orders
export const userGetOrder = TryCatch(async (req, res) => {
  const userID = req.user.id;

  const orders = await Order.find({
    user: userID,
  });

  if (!orders || orders.length === 0) {
    return res.status(404).json({ message: 'no orders found' });
  }
  const count = orders.length;

  return res.status(200).json({
    messages: 'orders',
    count,
    orders,
  });
});

// single order detail
export const userGetSingleOrder = TryCatch(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findById(id);

  if (!order) {
    return res.status(404).json({
      message: 'no order found',
    });
  }
  return res.status(200).json({
    message: 'order detail',
    order,
  });
});

//user cancel order

export const userCancelSingleOrder = TryCatch(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id

   
  //confirm that users owns his orders 
  
   const order = await Order.findOne({
    _id:id , user:userId
  })

  if(!order){
    return res.status(404).json({
      soccess:false,
      message :"No orders found"
    })
  }

  if (['delivered' ,'returned' , "cancelled" ].includes(order.orderStatus)){

    return res.status(400).json({
      success:false ,
      message :`cannot cancel an order that is already ${order.orderStatus}`
    })
  }

  const updatedOrder = await Order.findByIdAndUpdate(
    id,
    {orderStatus:"cancelled"},
    { new: true, runValidators: true }
  );
    if (!updatedOrder) {
    return res.status(404).json({
      message: 'no order found',
    });
  }
   return res.status(200).json({
    message: 'order cancelled',
    updatedOrder,
  });


});


// update  ---seller can change status 
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

  const order = await Order.findById(id).populate('items.product', 'seller name');

  if (!order) {
    return res.status(404).json({
      success: false,
      message: 'Order not found',
    });
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


// admin see alllllll orders

export const allOrdersForAdmin  = TryCatch(async (req , res)=>{


         const order = await Order.find()

         if(!order){
          return res.status(400).json({
            message:"no orders"
          })
         }

          const count = (await order).length
         return res.status(200).json({
          message:"orders",
          count , 
          order
         })
})
