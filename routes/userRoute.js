import express from 'express';
import {
  signUp,
  logIn,
  logOut,
  showInfo,
  getUsers,
  getSingleUser,
  updateUser,
  deleteUser,
  verifyOtpAndCreateAccount,
} from '../controller/userController.js';
import { authMiddleware } from '../middlewares/authmiddleware.js';
import validateUser from '../middlewares/validateUser.js';
import { checkRole } from '../middlewares/validateRole.js';

const router = express.Router();

// register and login
router.post('/register', validateUser, signUp);
router.post('/verify', verifyOtpAndCreateAccount);
router.post('/login', logIn);

router.post('/logout', authMiddleware, logOut);
router.get('/me', authMiddleware, showInfo);

router.get('/', authMiddleware, checkRole('admin'), getUsers);

router
  .route('/:id')
  .get(authMiddleware, checkRole('admin'), getSingleUser)
  .put(authMiddleware, updateUser)
  .delete(authMiddleware, checkRole('admin'), deleteUser);

export default router;
