import express from 'express';

import { checkRole } from '../middlewares/validateRole.js';
import { authMiddleware } from '../middlewares/authmiddleware.js';
import {
  addToCart,
  clearCart,
  getCart,
  removeAnItem,
  updateCartItems,
} from '../controller/cartController.js';

const router = express.Router();

router.post('/add', authMiddleware, addToCart);
router.get('/', authMiddleware, getCart);
router.put('/update', authMiddleware, updateCartItems);
router.delete('/remove/:id', authMiddleware, removeAnItem);
router.put('/empty', authMiddleware, clearCart);

export default router;
``