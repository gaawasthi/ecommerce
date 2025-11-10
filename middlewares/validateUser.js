import { createUserSchema } from '../schemas/userSchema.js';

export default function validateUser(req, res, next) {
  try {
    const { error, value } = createUserSchema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(422).json({
        message: 'Validation error',
        details: error.details.map(d => d.message), 
      });
    }
    req.validatedUser = value;
    next();
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
}
