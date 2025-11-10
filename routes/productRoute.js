import { Router } from 'express';
import {
  addProduct,
  deleteProduct,
  getMyProducts,
  getProducts,
  getSingleProduct,
  patchProduct,
  updateProduct,
} from '../controller/ProductController.js';
import { authMiddleware } from '../middlewares/authmiddleware.js';
import { checkRole } from '../middlewares/validateRole.js';

const router = Router();

// without seller route
router.get('/', getProducts);
router.get('/:id', getSingleProduct);

// seller protected route
router.post('/create', authMiddleware, checkRole('admin' , 'seller'), addProduct);
router.get('/my/products', authMiddleware, checkRole('seller'), getMyProducts);
router.delete(
  '/:id',
  authMiddleware,
  checkRole('admin', 'seller'),
  deleteProduct
);
router.put('/:id', authMiddleware, checkRole('admin', 'seller'), updateProduct);
router.patch(
  '/:id',
  authMiddleware,
  checkRole('admin', 'seller'),
  patchProduct
);

export default router;
