import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { TryCatch } from '../middlewares/TryCatch.js';
import { redisClient } from '../server.js';
import sendMail from '../utils/sendMail.js';

// registration route
// register user route
//http://localhost:8000/api/users/register
export const signUp = TryCatch(async (req, res) => {
  const userData = req.body;
  const { email } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'User already registered' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await redisClient.set(`otp:${email}`, otp, { EX: 300 });
  await redisClient.set(`pending:${email}`, JSON.stringify(userData), {
    EX: 300,
  });

  const subject = 'Verify your email - OTP for registration';
  const html = `<div style="font-family: Arial; text-align: center;">
    <h2>Welcome to MyApp!</h2>
    <p>Your verification code is:</p>
    <h1>${otp}</h1>
    <p>This code expires in 5 minutes.</p>
  </div>`;

  await sendMail({ email, subject, html });

  res.status(200).json({
    message: 'OTP sent successfully to your email. Please verify to complete registration.',
  });
});

// verity otp
//http://localhost:8000/api/users/verify
export const verifyOtpAndCreateAccount = TryCatch(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  const storedOtp = await redisClient.get(`otp:${email}`);
  if (!storedOtp) {
    return res.status(400).json({ message: 'OTP expired or invalid' });
  }

  if (storedOtp !== otp) {
    return res.status(400).json({ message: 'Incorrect OTP' });
  }

  const userDataStr = await redisClient.get(`pending:${email}`);
  if (!userDataStr) {
    return res.status(400).json({
      message: 'User data expired, please sign up again',
    });
  }

  const userData = JSON.parse(userDataStr);
  const { firstName, lastName, password, phone, role } = userData;

  const newUser = await User.create({
    firstName,
    lastName,
    email,
    password,
    phone,
    role,
  });

  await redisClient.del(`otp:${email}`);
  await redisClient.del(`pending:${email}`);

  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);

  res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
  });

  res.status(201).json({
    message: 'User registered successfully',
    user: {
      firstName: newUser.firstName,
      email: newUser.email,
    },
  });
});

// resend otp
//http://localhost:8000/api/users/resendOtp
export const resendOtp = TryCatch(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: 'email is required',
    });
  }

  const userDataStr = await redisClient.get(`pending:${email}`);
  if (!userDataStr) {
    return res.status(400).json({
      message: 'please sign up again data expired',
    });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await redisClient.set(`otp:${email}`, otp, { EX: 300 });

  const subject = 'Verify your email - New OTP';
  const html = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #333;">Your New Verification Code</h2>
    <div style="background: #f4f4f4; padding: 15px; text-align: center; border-radius: 5px;">
      <h1 style="color: #4CAF50; margin: 0; letter-spacing: 5px;">${otp}</h1>
    </div>
    <p style="color: #666; margin-top: 20px;">This code expires in 5 minutes.</p>
  </div>`;

  await sendMail({ email, subject, html });

  res.status(200).json({
    message: 'new otp sent successfully',
  });
});

//login
//http://localhost:8000/api/users/login
export const logIn = TryCatch(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  console.log(req.body, user);

  const matchPassword = await bcrypt.compare(password, user.password);
  if (!matchPassword) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

  res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
  });

  res.status(200).json({
    message: 'Login successful',
    token,
    id: user._id,
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
  });
});

// logout
export const logOut = TryCatch(async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    expires: new Date(0),
  });

  res.status(200).json({
    message: 'Logged out successfully',
  });
});

// password management route
//forget password
export const forgetPassword = TryCatch(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: 'User is not registered' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await redisClient.set(`otp:${email}`, otp, { EX: 300 });

  const subject = 'OTP for Password Reset';
  const html = `<div style="font-family: Arial; text-align: center;">
    <h2>Password Reset Request</h2>
    <p>Your verification code is:</p>
    <h1>${otp}</h1>
    <p>This code expires in 5 minutes.</p>
  </div>`;

  await sendMail({ email, subject, html });

  res.status(200).json({
    message: 'OTP sent successfully to reset password',
  });
});

// reset password
export const resetPassword = TryCatch(async (req, res) => {
  const { email, otp, new_password } = req.body;

  if (!email || !otp || !new_password) {
    return res
      .status(400)
      .json({ message: 'Email, OTP, and new password are required' });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const storedOtp = await redisClient.get(`otp:${email}`);
  if (!storedOtp) {
    return res.status(400).json({ message: 'OTP expired or invalid' });
  }

  if (storedOtp !== otp) {
    return res.status(400).json({ message: 'Incorrect OTP' });
  }

  user.password = new_password;
  await user.save();

  await redisClient.del(`otp:${email}`);

  return res.status(200).json({
    message: 'Password reset successfully',
  });
});

// change password
export const changePassword = TryCatch(async (req, res) => {
  const { password, new_password } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'unauthorized' });
  }

  const user = await User.findById(userId).select('+password');
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: 'Incorrect current password' });
  }

  const hashedPassword = await bcrypt.hash(new_password, 10);
  user.password = hashedPassword;
  await user.save();

  res.status(200).json({
    message: 'Password changed successfully',
  });
});

// user routes
// protected show info
export const showInfo = TryCatch(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');

  res.status(200).json({
    message: 'User profile',
    user,
  });
});

// update user
export const updateUser = TryCatch(async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  const user = await User.findByIdAndUpdate(id, data, { new: true });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.status(200).json({
    message: 'User updated successfully',
    user,
  });
});

// admin routes
// get all users
export const getUsers = TryCatch(async (req, res) => {
  const users = await User.find();

  res.status(200).json({
    message: 'Users fetched successfully',
    users,
  });
});

//get single
export const getSingleUser = TryCatch(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.status(200).json({
    message: 'User fetched successfully',
    user,
  });
});

// delete
export const deleteUser = TryCatch(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByIdAndDelete(id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.status(200).json({
    message: 'User deleted successfully',
    user,
  });
});