import { List } from '../models/List.js';
import { Board } from '../models/Board.js';
import { Card } from '../models/Card.js';
import { Activity } from '../models/Activity.js';
import { z } from 'zod';

const listCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  boardId: z.string().min(1, 'Board ID is required')
});

const listUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100)
});

export const createList = async (req, res, next) => {
  try {
    const { title, boardId } = listCreateSchema.parse(req.body);
    const userId = req.user.userId;

    // Verify board membership
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const isMember = board.members.some(m => m.user.toString() === userId.toString() && m.status === 'accepted') || board.owner.toString() === userId.toString();
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied. You cannot edit this board.' });
    }

    // Get position
    const lastList = await List.findOne({ board: boardId }).sort({ position: -1 });
    const position = lastList ? lastList.position + 1 : 0;

    const list = await List.create({
      title,
      board: boardId,
      position
    });

    // Log Activity
    await Activity.create({
      board: boardId,
      user: userId,
      type: 'list_created',
      data: {
        listTitle: title
      }
    });

    res.status(201).json(list);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    next(error);
  }
};

export const updateList = async (req, res, next) => {
  try {
    const { listId } = req.params;
    const { title } = listUpdateSchema.parse(req.body);
    const userId = req.user.userId;

    const list = await List.findById(listId);
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    // Verify board membership
    const board = await Board.findById(list.board);
    if (!board) {
      return res.status(404).json({ error: 'Board associated with list not found' });
    }

    const isMember = board.members.some(m => m.user.toString() === userId.toString() && m.status === 'accepted') || board.owner.toString() === userId.toString();
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied. You cannot edit this board.' });
    }

    list.title = title;
    await list.save();

    res.json(list);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    next(error);
  }
};

export const deleteList = async (req, res, next) => {
  try {
    const { listId } = req.params;
    const userId = req.user.userId;

    const list = await List.findById(listId);
    if (!list) {
      return res.status(404).json({ error: 'List not found' });
    }

    // Verify board membership
    const board = await Board.findById(list.board);
    if (!board) {
      return res.status(404).json({ error: 'Board associated with list not found' });
    }

    const isMember = board.members.some(m => m.user.toString() === userId.toString() && m.status === 'accepted') || board.owner.toString() === userId.toString();
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied. You cannot edit this board.' });
    }

    // Delete list
    await List.findByIdAndDelete(listId);

    // Archive all cards under this list
    await Card.updateMany({ list: listId }, { isArchived: true });

    res.json({ message: 'List deleted and associated cards archived successfully' });
  } catch (error) {
    next(error);
  }
};
