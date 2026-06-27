import { Router } from 'express';
import { createList, updateList, deleteList } from '../controllers/listController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.post('/', createList);
router.put('/:listId', updateList);
router.delete('/:listId', deleteList);

export { router as listRoutes };
