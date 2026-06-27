import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'card_created',
      'card_moved',
      'card_assigned',
      'card_due_date',
      'card_commented',
      'list_created',
      'member_added',
      'member_invited'
    ],
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed
  }
}, { timestamps: true });

activitySchema.index({ board: 1, createdAt: -1 });

export const Activity = mongoose.model('Activity', activitySchema);
