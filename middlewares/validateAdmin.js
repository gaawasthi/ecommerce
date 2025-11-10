import User from '../models/User.js';

export const isAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: 'no user find',
      });
    }
    const admin = await User.findById(req.user.id);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({
        message: 'only admin allowed',
      });
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'server error admin',
    });
  }
};
