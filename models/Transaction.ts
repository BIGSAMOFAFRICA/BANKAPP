import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITransaction extends Document {
  fromAccount?: string;
  toAccount?: string;
  amount: number;
  type: 'credit' | 'debit';
  timestamp: Date;
  description?: string;
  reported?: boolean;
  reportReason?: string;
  reportedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    fromAccount: {
      type: String,
      trim: true,
    },
    toAccount: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than 0'],
    },
    type: {
      type: String,
      enum: ['credit', 'debit'],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    description: {
      type: String,
      trim: true,
    },
    reported: {
      type: Boolean,
      default: false,
      index: true,
    },
    reportReason: {
      type: String,
      trim: true,
    },
    reportedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Conditional validation depending on transaction type
TransactionSchema.pre<ITransaction>('validate', function (next) {
  if (this.type === 'credit') {
    if (!this.toAccount) {
      return next(new Error('toAccount is required for credit transactions'));
    }
  } else if (this.type === 'debit') {
    if (!this.fromAccount || !this.toAccount) {
      return next(new Error('fromAccount and toAccount are required for debit transactions'));
    }
  }
  next();
});

// Indexes for faster queries
TransactionSchema.index({ fromAccount: 1, timestamp: -1 });
TransactionSchema.index({ toAccount: 1, timestamp: -1 });

const Transaction: Model<ITransaction> =
  mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;
