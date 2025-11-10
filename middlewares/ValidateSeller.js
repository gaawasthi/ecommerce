import User from '../models/User.js';

export const isSeller = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: ' No user id provided' });
    }

    const seller = await User.findById(req.user.id);

    if (!seller || seller.role !== 'seller') {
      return res.status(403).json({ message: ' only sellers allowed' });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error seller' });
  }
};
