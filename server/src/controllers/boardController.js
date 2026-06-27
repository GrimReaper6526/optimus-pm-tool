import { Board } from '../models/Board.js';
import { List } from '../models/List.js';
import { Card } from '../models/Card.js';
import { User } from '../models/User.js';
import { Activity } from '../models/Activity.js';
import { z } from 'zod';

const boardSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).optional().default(''),
  coverColor: z.enum(['indigo', 'cyan', 'violet', 'emerald', 'rose', 'amber']).optional().default('indigo')
});

const memberSchema = z.object({
  usernameOrEmail: z.string().min(1, 'Username or Email is required')
});

export const createBoard = async (req, res, next) => {
  try {
    const data = boardSchema.parse(req.body);
    const ownerId = req.user.userId;

    const board = await Board.create({
      title: data.title,
      description: data.description,
      coverColor: data.coverColor,
      owner: ownerId,
      members: [{ user: ownerId, role: 'admin' }]
    });

    // Create default lists for new board (To Do, In Progress, Done)
    await List.create([
      { title: 'To Do', board: board._id, position: 0 },
      { title: 'In Progress', board: board._id, position: 1 },
      { title: 'Done', board: board._id, position: 2 }
    ]);

    res.status(201).json(board);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    next(error);
  }
};

export const getBoards = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    // Fetch boards owned by user or where user is an accepted member
    const boards = await Board.find({
      $or: [
        { owner: userId },
        { members: { $elemMatch: { user: userId, status: 'accepted' } } }
      ],
      isArchived: false
    }).populate('owner', 'username email avatar');

    res.json(boards);
  } catch (error) {
    next(error);
  }
};

export const getBoardById = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const userId = req.user.userId;

    const board = await Board.findOne({ _id: boardId, isArchived: false })
      .populate('owner', 'username email avatar')
      .populate('members.user', 'username email avatar');

    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    // Verify membership - must be an accepted member
    const isMember = board.members.some(m => m.user._id.toString() === userId.toString() && m.status === 'accepted') || board.owner._id.toString() === userId.toString();
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied. You are not a member of this board.' });
    }

    // Fetch lists and cards
    const lists = await List.find({ board: boardId }).sort({ position: 1 });
    const cards = await Card.find({ board: boardId, isArchived: false })
      .populate('assignees', 'username avatar email')
      .sort({ position: 1 });

    // Format lists with their cards embedded
    const formattedLists = lists.map(list => {
      const listCards = cards.filter(card => card.list.toString() === list._id.toString());
      return {
        ...list.toObject(),
        cards: listCards
      };
    });

    res.json({
      board,
      lists: formattedLists
    });
  } catch (error) {
    next(error);
  }
};

export const updateBoard = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const userId = req.user.userId;
    const data = boardSchema.parse(req.body);

    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    // Authorization check: Only owner or admin member can update board settings
    const member = board.members.find(m => m.user.toString() === userId.toString());
    const isAdmin = member && member.role === 'admin';
    const isOwner = board.owner.toString() === userId.toString();

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Only board admins or owners can update the board.' });
    }

    board.title = data.title;
    board.description = data.description;
    board.coverColor = data.coverColor;
    await board.save();

    res.json(board);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    next(error);
  }
};

export const archiveBoard = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const userId = req.user.userId;

    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    if (board.owner.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Only the board owner can archive the board.' });
    }

    board.isArchived = true;
    await board.save();

    res.json({ message: 'Board archived successfully' });
  } catch (error) {
    next(error);
  }
};

export const addMember = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const userId = req.user.userId;
    const { usernameOrEmail } = memberSchema.parse(req.body);

    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    // Verify current user is admin/owner
    const isOwner = board.owner.toString() === userId.toString();
    const currentMember = board.members.find(m => m.user.toString() === userId.toString());
    const isAdmin = currentMember && currentMember.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Only board admins or owners can add members.' });
    }

    // Find the user to add
    const targetUser = await User.findOne({
      $or: [
        { email: usernameOrEmail },
        { username: usernameOrEmail }
      ]
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user is the owner of this board
    if (board.owner.toString() === targetUser._id.toString()) {
      return res.status(400).json({ error: 'User is the owner of this board.' });
    }

    // Check if user is already a member or invited
    const existingMember = board.members.find(m => m.user.toString() === targetUser._id.toString());
    if (existingMember) {
      if (existingMember.status === 'pending') {
        return res.status(400).json({ error: 'User has already been invited to this board.' });
      }
      return res.status(400).json({ error: 'User is already a member of this board.' });
    }

    // Perform atomic push to avoid race conditions from double clicks
    const updatedBoard = await Board.findOneAndUpdate(
      {
        _id: boardId,
        owner: { $ne: targetUser._id },
        'members.user': { $ne: targetUser._id }
      },
      {
        $push: {
          members: { user: targetUser._id, role: 'member', status: 'pending' }
        }
      },
      { new: true }
    );

    if (!updatedBoard) {
      const checkBoard = await Board.findById(boardId);
      if (!checkBoard) {
        return res.status(404).json({ error: 'Board not found' });
      }
      if (checkBoard.owner.toString() === targetUser._id.toString()) {
        return res.status(400).json({ error: 'User is the owner of this board.' });
      }
      const doubleCheck = checkBoard.members.find(m => m.user.toString() === targetUser._id.toString());
      if (doubleCheck) {
        if (doubleCheck.status === 'pending') {
          return res.status(400).json({ error: 'User has already been invited to this board.' });
        }
        return res.status(400).json({ error: 'User is already a member of this board.' });
      }
      return res.status(400).json({ error: 'Failed to add user to board.' });
    }

    // Log Activity
    await Activity.create({
      board: board._id,
      user: userId,
      type: 'member_invited',
      data: {
        memberName: targetUser.username
      }
    });

    res.json({
      message: `${targetUser.username} is notified. They will be added to the board when they accept the request.`,
      user: {
        id: targetUser._id,
        username: targetUser.username,
        avatar: targetUser.avatar,
        email: targetUser.email,
        status: 'pending'
      }
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    next(error);
  }
};

export const searchUsers = async (req, res, next) => {
  try {
    const { query } = req.query;
    if (!query || query.length < 2) {
      return res.json([]);
    }

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).limit(10).select('username email avatar');

    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const getAllActivities = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const boards = await Board.find({
      $or: [
        { owner: userId },
        { members: { $elemMatch: { user: userId, status: 'accepted' } } }
      ],
      isArchived: false
    });
    const boardIds = boards.map(b => b._id);

    const activities = await Activity.find({ board: { $in: boardIds } })
      .populate('user', 'username avatar')
      .populate('board', 'title')
      .sort({ createdAt: -1 })
      .limit(30);

    res.json(activities);
  } catch (error) {
    next(error);
  }
};

export const getAllTasks = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const boards = await Board.find({
      $or: [
        { owner: userId },
        { members: { $elemMatch: { user: userId, status: 'accepted' } } }
      ],
      isArchived: false
    });
    const boardIds = boards.map(b => b._id);

    const cards = await Card.find({ board: { $in: boardIds }, isArchived: false })
      .populate('assignees', 'username avatar email')
      .populate('board', 'title coverColor')
      .populate('list', 'title')
      .sort({ dueDate: 1, updatedAt: -1 });

    res.json(cards);
  } catch (error) {
    next(error);
  }
};

export const getInvitations = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const invitations = await Board.find({
      members: { $elemMatch: { user: userId, status: 'pending' } },
      isArchived: false
    }).populate('owner', 'username email avatar');

    res.json(invitations);
  } catch (error) {
    next(error);
  }
};

export const acceptInvitation = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const userId = req.user.userId;

    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const member = board.members.find(m => m.user.toString() === userId.toString());
    if (!member || member.status !== 'pending') {
      return res.status(400).json({ error: 'No pending invitation found for this board.' });
    }

    member.status = 'accepted';
    await board.save();

    // Fetch user details for activity log
    const userObj = await User.findById(userId);

    // Log Activity
    await Activity.create({
      board: board._id,
      user: userId,
      type: 'member_added',
      data: {
        memberName: userObj?.username || 'New Member'
      }
    });

    res.json({ message: 'Invitation accepted successfully', board });
  } catch (error) {
    next(error);
  }
};

export const declineInvitation = async (req, res, next) => {
  try {
    const { boardId } = req.params;
    const userId = req.user.userId;

    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }

    const memberIndex = board.members.findIndex(m => m.user.toString() === userId.toString() && m.status === 'pending');
    if (memberIndex === -1) {
      return res.status(400).json({ error: 'No pending invitation found for this board.' });
    }

    // Remove the user from the members array
    board.members.splice(memberIndex, 1);
    await board.save();

    res.json({ message: 'Invitation declined successfully' });
  } catch (error) {
    next(error);
  }
};
