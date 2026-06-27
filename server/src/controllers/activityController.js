import { Activity } from '../models/Activity.js';
import { Board } from '../models/Board.js';

export const getBoardActivities = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const userId = req.user.userId;

    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const isMember = board.members.some(m => m.user.toString() === userId.toString() && m.status === 'accepted') || board.owner.toString() === userId.toString();
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const activities = await Activity.find({ board: boardId })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(activities);
  } catch (error) {
    next(error);
  }
};
