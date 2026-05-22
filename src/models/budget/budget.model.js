import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
  {
    limit: {
      type: Number,
      required: [true, 'Budget limit is required'],
      min: [0, 'Limit must be greater than or equal to 0'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    month: {
      type: String,
      required: [true, 'Budget target month is required (format: YYYY-MM)'],
      match: [/^\d{4}-\d{2}$/, 'Please enter a valid month in YYYY-MM format'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one budget per category per month per user
budgetSchema.index({ userId: 1, category: 1, month: 1 }, { unique: true });

export const Budget = mongoose.models.Budget || mongoose.model('Budget', budgetSchema);
export default Budget;
