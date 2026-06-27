import mongoose from 'mongoose';

const boardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500,
    default: ''
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted'],
      default: 'accepted'
    }
  }],
  coverColor: {
    type: String,
    enum: ['indigo', 'cyan', 'violet', 'emerald', 'rose', 'amber'],
    default: 'indigo'
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

boardSchema.index({ owner: 1, isArchived: 1 });
boardSchema.index({ 'members.user': 1, isArchived: 1 });

export const Board = mongoose.model('Board', boardSchema);
