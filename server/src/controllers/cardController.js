import { Card } from '../models/Card.js';
import { List } from '../models/List.js';
import { Board } from '../models/Board.js';
import { Activity } from '../models/Activity.js';
import { z } from 'zod';

const cardCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  listId: z.string().min(1, 'List ID is required'),
  boardId: z.string().min(1, 'Board ID is required')
});

const cardUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200).optional(),
  description: z.string().max(2000).optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  dueDate: z.string().nullable().optional(),
  assignees: z.array(z.string()).optional(),
  labels: z.array(z.object({
    text: z.string(),
    color: z.string()
  })).optional()
});

const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000)
});

export const createCard = async (req, res, next) => {
  try {
    const { title, listId, boardId } = cardCreateSchema.parse(req.body);
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

    // Get max position in this list
    const lastCard = await Card.findOne({ list: listId, board: boardId, isArchived: false }).sort({ position: -1 });
    const position = lastCard ? lastCard.position + 1 : 0;

    const card = await Card.create({
      title,
      list: listId,
      board: boardId,
      position
    });

    // Log Activity
    await Activity.create({
      board: boardId,
      user: userId,
      type: 'card_created',
      data: {
        cardTitle: title
      }
    });

    res.status(201).json(card);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    next(error);
  }
};

export const getCard = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const userId = req.user.userId;

    const card = await Card.findById(cardId)
      .populate('assignees', 'username avatar email')
      .populate('comments.author', 'username avatar');

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // Verify board membership
    const board = await Board.findById(card.board);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const isMember = board.members.some(m => m.user.toString() === userId.toString() && m.status === 'accepted') || board.owner.toString() === userId.toString();
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    res.json(card);
  } catch (error) {
    next(error);
  }
};

export const updateCard = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const userId = req.user.userId;
    const updates = cardUpdateSchema.parse(req.body);

    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // Verify board membership
    const board = await Board.findById(card.board);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const isMember = board.members.some(m => m.user.toString() === userId.toString() && m.status === 'accepted') || board.owner.toString() === userId.toString();
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    // Log individual updates to board activity if applicable
    if (updates.priority && updates.priority !== card.priority) {
      await Activity.create({
        board: card.board,
        user: userId,
        type: 'card_created', // We can reuse card_created or log specific messages
        data: {
          cardTitle: card.title,
          detail: `set priority to ${updates.priority}`
        }
      });
    }

    if (updates.title) card.title = updates.title;
    if (updates.description !== undefined) card.description = updates.description;
    if (updates.priority) card.priority = updates.priority;
    if (updates.dueDate !== undefined) card.dueDate = updates.dueDate ? new Date(updates.dueDate) : null;
    if (updates.assignees) card.assignees = updates.assignees;
    if (updates.labels) card.labels = updates.labels;

    await card.save();

    const populatedCard = await Card.findById(cardId)
      .populate('assignees', 'username avatar email')
      .populate('comments.author', 'username avatar');

    res.json(populatedCard);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    next(error);
  }
};

export const archiveCard = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const userId = req.user.userId;

    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    // Verify membership
    const board = await Board.findById(card.board);
    if (!board) return res.status(404).json({ error: 'Board not found' });
    const isMember = board.members.some(m => m.user.toString() === userId.toString() && m.status === 'accepted') || board.owner.toString() === userId.toString();
    if (!isMember) return res.status(403).json({ error: 'Access denied.' });

    card.isArchived = true;
    await card.save();

    res.json({ message: 'Card archived successfully' });
  } catch (error) {
    next(error);
  }
};

export const moveCard = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const { targetListId, newPosition } = req.body;
    const userId = req.user.userId;

    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const board = await Board.findById(card.board);
    if (!board) return res.status(404).json({ error: 'Board not found' });
    const isMember = board.members.some(m => m.user.toString() === userId.toString() && m.status === 'accepted') || board.owner.toString() === userId.toString();
    if (!isMember) return res.status(403).json({ error: 'Access denied.' });

    const sourceListId = card.list.toString();
    const sourceList = await List.findById(sourceListId);
    const targetList = await List.findById(targetListId);

    if (!targetList) {
      return res.status(404).json({ error: 'Target list not found' });
    }

    // If moving within same list
    if (sourceListId === targetListId) {
      const listCards = await Card.find({ list: sourceListId, board: card.board, isArchived: false, _id: { $ne: cardId } }).sort({ position: 1 });
      
      // Insert card at new position
      listCards.splice(newPosition, 0, card);

      // Re-index all cards in the list
      for (let i = 0; i < listCards.length; i++) {
        listCards[i].position = i;
        await listCards[i].save();
      }
    } else {
      // If moving between different lists
      const sourceCards = await Card.find({ list: sourceListId, board: card.board, isArchived: false, _id: { $ne: cardId } }).sort({ position: 1 });
      const targetCards = await Card.find({ list: targetListId, board: card.board, isArchived: false }).sort({ position: 1 });

      // Re-index source list
      for (let i = 0; i < sourceCards.length; i++) {
        sourceCards[i].position = i;
        await sourceCards[i].save();
      }

      // Insert into target list
      targetCards.splice(newPosition, 0, card);
      card.list = targetListId;

      // Re-index target list
      for (let i = 0; i < targetCards.length; i++) {
        targetCards[i].position = i;
        targetCards[i].list = targetListId;
        await targetCards[i].save();
      }

      // Log movement activity
      await Activity.create({
        board: card.board,
        user: userId,
        type: 'card_moved',
        data: {
          cardTitle: card.title,
          fromList: sourceList.title,
          toList: targetList.title
        }
      });
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const addComment = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const userId = req.user.userId;
    const { content } = commentSchema.parse(req.body);

    const card = await Card.findById(cardId);
    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const board = await Board.findById(card.board);
    if (!board) return res.status(404).json({ error: 'Board not found' });
    const isMember = board.members.some(m => m.user.toString() === userId.toString() && m.status === 'accepted') || board.owner.toString() === userId.toString();
    if (!isMember) return res.status(403).json({ error: 'Access denied.' });

    card.comments.push({
      author: userId,
      content
    });

    await card.save();

    const updatedCard = await Card.findById(cardId)
      .populate('assignees', 'username avatar email')
      .populate('comments.author', 'username avatar');

    // Log Activity
    await Activity.create({
      board: card.board,
      user: userId,
      type: 'card_commented',
      data: {
        cardTitle: card.title,
        commentSnippet: content.slice(0, 30) + (content.length > 30 ? '...' : '')
      }
    });

    res.status(201).json(updatedCard);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    next(error);
  }
};
