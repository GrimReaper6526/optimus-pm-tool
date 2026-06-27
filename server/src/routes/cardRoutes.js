import { Router } from 'express';
import { createCard, getCard, updateCard, archiveCard, moveCard, addComment } from '../controllers/cardController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.post('/', createCard);
router.get('/:cardId', getCard);
router.put('/:cardId', updateCard);
router.delete('/:cardId', archiveCard);
router.patch('/:cardId/move', moveCard);
router.post('/:cardId/comments', addComment);

export { router as cardRoutes };
