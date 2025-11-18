import { Router } from 'express';
import {
  addProduct,
  deleteProduct,
  getMyProducts,
  getProducts,
  getSearchedProduct,
  getSingleProduct,

  updateProduct,
} from '../controller/ProductController.js';
import { authMiddleware } from '../middlewares/authmiddleware.js';
import { checkRole } from '../middlewares/validateRole.js';
import { upload } from '../middlewares/multer.js';

const router = Router();

// GET all products
router.get('/', getProducts); // http://localhost:8000/api/products


 // getSearched products 
 router.get('/search' , getSearchedProduct)

// GET seller's own products
router.get('/my/products', authMiddleware, checkRole('seller'), getMyProducts);


// GET one product by ID
router.get('/:id', getSingleProduct); // http://localhost:8000/api/products/:id

// Create product
router.post(
  '/create',
  authMiddleware,
  checkRole('admin', 'seller'),
  upload.array('images', 5),
  addProduct
);

// Update product
router.put('/:id', authMiddleware, checkRole('admin', 'seller'), updateProduct);

// Delete product
router.delete('/:id', authMiddleware, checkRole('admin', 'seller'), deleteProduct);


export default router;
