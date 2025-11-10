import mongoose from 'mongoose';
import validator from 'validator';

const TaskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
        type:String,
        required:[true , "title cannot be empty "],
        minlength: [3, 'title must be at least 3 characters long']
         
    },
    description: {
        type:String,
            
    },
    completed: {
        type:Boolean,
        default:false
    },
  },
  { timestamps: true }
);
export const Task = mongoose.model('Task' , TaskSchema)