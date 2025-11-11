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
  resendOtp,
  forgetPassword,
  resetPassword,
  changePassword,
} from '../controller/userController.js';
import { authMiddleware } from '../middlewares/authmiddleware.js';
import validateUser from '../middlewares/validateUser.js';
import { checkRole } from '../middlewares/validateRole.js';

const router = express.Router();

// auth routes
router.post('/register', validateUser, signUp);
router.post('/resendOtp', resendOtp, signUp);
router.post('/verify', verifyOtpAndCreateAccount);
router.post('/login', logIn);
router.post('/logout', authMiddleware, logOut);
// password management 
router.post('/reset', forgetPassword);
router.post('/reset/password' , resetPassword)
router.post ('/password/change' ,authMiddleware , changePassword)
// user routes
router.get('/me', authMiddleware, showInfo);
router.put('/:id' , authMiddleware, updateUser)

router.put('/:id',authMiddleware, updateUser)

//admin routes
router.get('/', authMiddleware, checkRole('admin'), getUsers);
router
  .route('/:id')
  .get(authMiddleware, checkRole('admin'), getSingleUser)
  .delete(authMiddleware, checkRole('admin'), deleteUser);

export default router;
