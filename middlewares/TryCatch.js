export const TryCatch = (handler) => {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      console.log(error);
      
      return res.status(500).json({
        message: ' server error',
        error: error.message,

      });
    }
  };
};
