import { Router } from 'express';
import { authMiddleware } from '../middlewares/authmiddleware.js';
import {
    allOrdersForAdmin,
  createOrder,
  getSellerProductOrder,
  sellerUpdateOrder,
  userCancelSingleOrder,
  userGetOrder,
  userGetSingleOrder,
} from '../controller/OrderContoller.js';
import { checkRole } from '../middlewares/validateRole.js';

const router = Router();

router.post('/create', authMiddleware, createOrder);
router.get(
  '/seller/orders',
  authMiddleware,
  checkRole('seller', 'admin'),
  getSellerProductOrder
);
router.get('/all',  authMiddleware ,checkRole('admin'), allOrdersForAdmin);
router.get('/orders', authMiddleware, userGetOrder);
router.get('/orders/:id', authMiddleware, userGetSingleOrder);
router.get('/orders/cancel/:id', authMiddleware, userCancelSingleOrder);
router.post('/orders/update/:id', authMiddleware, sellerUpdateOrder);

export default router;

//api/products/order/create
