import express from 'express';

import { checkRole } from '../middlewares/validateRole.js';
import { authMiddleware } from '../middlewares/authmiddleware.js';
import { lastWeekData, topCustomers, topProducts, topSellers, totalRevenue } from '../controller/adminAnalytics.js';

const router = express.Router();

router.get("/total" , authMiddleware , checkRole("admin") , totalRevenue)

router.get("/week" , authMiddleware , checkRole("admin") , lastWeekData)
router.get("/customer/top" , authMiddleware , checkRole("admin") , topCustomers)
router.get("/product/top" , authMiddleware , checkRole("admin") , topProducts)
router.get("/seller/top" , authMiddleware , checkRole("admin") , topSellers)
export default router;
