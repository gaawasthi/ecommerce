import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

///    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'first name cannot be empty'],
      minlength: [3, 'first name must be at least 3 characters long'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'last name cannot be empty'],
      minlength: [3, 'last name must be at least 3 characters long'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: validator.isEmail,
        message: 'invalid email format',
      },
    },
    password: {
      type: String,
      required: [true, 'password is required'],
      minlength: [6, 'password must be at least 6 characters long'],
      select: false,
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['customer', 'admin', 'seller'],
      default: 'customer',
    }
  },
  { timestamps: true }
);
userSchema.pre('save', async function (next) {
  // if it is not modified save it directly
  if (!this.isModified('password')) return next();

  // if modified first hash it
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model('User', userSchema);

export default User;
