import jwt from 'jsonwebtoken';

export async function authMiddleware(req, res, next) {
  // const authHeader = req.header('Authorization')
  // const token = authHeader && authHeader.split(' ')[1];
  // console.log(req.header('cookie'));
  // if (token == null) return res.status(401).json('no token');
  // try {
  //
  //
  //   next();
  // } catch (error) {
  //   return res.status(401).json('invalid token', error);
  // }

  if (req.cookies.token) {
    try {
      const token = req.cookies.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next()
    } catch (error) {
      return res.status(401).json('invalid token', error);
    }
    }else{
      res.status(400).json({
        message:"no token provided"
      })
    }
  }

