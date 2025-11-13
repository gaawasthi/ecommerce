import express from 'express';

import { checkRole } from '../middlewares/validateRole.js';
import { authMiddleware } from '../middlewares/authmiddleware.js';
import { totalRevenue } from '../controller/adminAnalytics.js';
import { deliverdOrders, lowStockProducts, pendingOrders, totalRevenueSeller } from '../controller/sellerAnalytics.js';

const router = express.Router();

router.get('/total' , authMiddleware , checkRole("seller") , totalRevenueSeller )
router.get('/low' , authMiddleware , checkRole("seller") , lowStockProducts )
router.get('/del' , authMiddleware , checkRole("seller") , deliverdOrders )

export default router;
