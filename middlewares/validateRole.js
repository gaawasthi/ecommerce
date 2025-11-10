import User from '../models/User.js';

export const checkRole = (...roles) => {
  return async (req, res, next) => {
    console.log(req.user);
    
    try {
      if (!req.user.id) {
        return res.status(401).json({
          message: 'no user id provided ',
        });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return res.staus(401).json({
          message: 'user not found ',
        });
      }

      if (!roles.includes(user.role)) {
        return res.status(403).json({
          message: 'permission denied',
        });
      }
      next()
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: 'Server error validating role',
      });
    }
  };
};
