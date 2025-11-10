import express from 'express';

import { checkRole } from '../middlewares/validateRole.js';
import { authMiddleware } from '../middlewares/authmiddleware.js';
import {
  addToCart,
  getCart,
  removeAnItem,
  updateCartItems,
} from '../controller/cartController.js';

const router = express.Router();

router.post('/cart', authMiddleware, addToCart);
router.get('/cart', authMiddleware, getCart);
router.post('/update/', authMiddleware, updateCartItems);
router.put('/remove/:id', authMiddleware, removeAnItem);

export default router;
