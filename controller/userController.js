import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { TryCatch } from '../middlewares/TryCatch.js';
import { redisClient } from '../server.js';
import sendMail from '../utils/sendMail.js';

// register user route

export const signUp = TryCatch(async (req, res) => {
  const userData = req.body;
  const { email } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'User already registered' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000);

  await redisClient.set(`otp:${email}`, otp, { EX: 300 });
  await redisClient.set(`pending:${email}`, JSON.stringify(userData), {
    EX: 300,
  });

  const subject = 'Verify your email - OTP for registration';
  const html = `
    <div style="font-family: Arial; text-align: center;">
      <h2>Welcome to MyApp!</h2>
      <p>Your verification code is:</p>
      <h1>${otp}</h1>
      <p>This code expires in 5 minutes.</p>
    </div>
  `;

  await sendMail({ email, subject, html });

  res.status(200).json({
    message:
      'OTP sent successfully to your email. Please verify to complete registration.',
  });
});



export const verifyOtpAndCreateAccount = async (req, res) => {
  try {
    const {  otp } = req.body;

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
    const { firstName, lastName, email ,password, phone, role } = userData;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      role,
    });


    await redisClient.del(`otp:${email}`);
    await redisClient.del(`pending:${email}`);

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error('Error verifying OTP:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


//login
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

  res.json({
    message: 'Login successful',
    token,
  });
});

// logout
export const logOut = TryCatch(async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({
    message: 'Logged out successfully',
  });
});

// protected show info
export const showInfo = TryCatch(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.status(200).json({
    message: 'User profile',
    user,
  });
});

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

//update
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
