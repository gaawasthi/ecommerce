import Joi from 'joi';

export const nameRegex = /^[A-Za-z\s]+$/;
export const passwordRegex = /^(?=.*[A-Za-z]).{8,}$/;

export const createUserSchema = Joi.object({
  firstName: Joi.string()
    .pattern(nameRegex)
    .min(3)
    .max(20)
    .required()
    .messages({
      'string.empty': 'First name is required.',
      'string.pattern.base': 'First name can only contain letters and spaces.',
      'string.min': 'First name should have at least 3 characters.',
      'string.max': 'First name should not exceed 20 characters.'
    }),

  lastName: Joi.string()
    .pattern(nameRegex)
    .min(3)
    .max(20)
    .required()
    .messages({
      'string.empty': 'Last name is required.',
      'string.pattern.base': 'Last name can only contain letters and spaces.',
      'string.min': 'Last name should have at least 3 characters.',
      'string.max': 'Last name should not exceed 20 characters.'
    }),

  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.empty': 'Email is required.',
      'string.email': 'Please enter a valid email address.'
    }),

  password: Joi.string()
    .pattern(passwordRegex)
    .required()
    .messages({
      'string.empty': 'Password is required.',
      'string.pattern.base': 'Password must be at least 8 characters long and include at least one letter.'
    }),

  phone: Joi.string()
    .pattern(/^[0-9]{10,15}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Phone number must be between 10 to 15 digits.'
    }),

  role: Joi.string()
    .valid('customer', 'admin', 'seller')
    .default('customer')
    .messages({
      'any.only': 'Role must be one of customer, admin, or seller.'
    }),
});
