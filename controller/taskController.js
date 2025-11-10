import { Task } from '../models/Task.js';
import { TryCatch } from '../middlewares/TryCatch.js';

//add
export const addTask = TryCatch(async (req, res) => {
  const { title, description } = req.body;
  const userId = req.user?.id;

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  const task = new Task({ title, description, user: userId });
  await task.save();

  return res.status(201).json({
    message: 'Task created successfully',
    task,
  });
});

// get all
export const getTasks = TryCatch(async (req, res) => {
  const userID = req.user?.id;
  const tasks = await Task.find({ user: userID });

  return res.status(200).json({
    message: 'Tasks fetched successfully',
    tasks,
  });
});

// get single
export const getSingleTask = TryCatch(async (req, res) => {
  const { id } = req.params;
  const task = await Task.findById(id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  return res.status(200).json({
    message: 'Task fetched successfully',
    task,
  });
});

// delete
export const deleteTask = TryCatch(async (req, res) => {
  const { id } = req.params;
  const task = await Task.findByIdAndDelete(id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  return res.status(200).json({
    message: 'Task deleted successfully',
    task,
  });
});

//update
export const updateTask = TryCatch(async (req, res) => {
  const { id } = req.params;
  const task = await Task.findByIdAndUpdate(id, req.body, { new: true });

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  return res.status(200).json({
    message: 'Task updated successfully',
    task,
  });
});
