import { Router } from 'express';
import { createBoard, getBoards, getBoardById, updateBoard, archiveBoard, addMember, searchUsers, getAllActivities, getAllTasks, getInvitations, acceptInvitation, declineInvitation } from '../controllers/boardController.js';
import { getBoardActivities } from '../controllers/activityController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticate);

router.post('/', createBoard);
router.get('/', getBoards);
router.get('/search', searchUsers);
router.get('/invitations', getInvitations);
router.get('/activities/all', getAllActivities);
router.get('/tasks/all', getAllTasks);
router.get('/:boardId', getBoardById);
router.put('/:boardId', updateBoard);
router.delete('/:boardId', archiveBoard);
router.post('/:boardId/members', addMember);
router.post('/:boardId/accept', acceptInvitation);
router.post('/:boardId/decline', declineInvitation);
router.get('/:boardId/activities', getBoardActivities);

export { router as boardRoutes };
