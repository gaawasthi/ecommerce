import { Router } from 'express';
import { authMiddleware } from '../middlewares/authmiddleware.js';
import {
  addTask,
  deleteTask,
  getSingleTask,
  getTasks,
  updateTask,
} from '../controller/taskController.js';

const router = Router();

router.post('/create', authMiddleware, addTask);
router.get('/', authMiddleware, getTasks);

router.get('/:id', authMiddleware, getSingleTask);
router.delete('/:id', authMiddleware, deleteTask);
router.put('/:id', authMiddleware, updateTask);

export default router;
