import { ApolloServer } from 'apollo-server-micro';
import { MicroRequest } from 'apollo-server-micro/dist/types';
import { ServerResponse } from 'http';
import { makeExecutableSchema } from '@graphql-tools/schema';
import connectToDatabase from '@/lib/db';
import User, { IUser } from '@/models/User';
import Transaction, { ITransaction } from '@/models/Transaction';
import { generateToken, verifyToken, TokenPayload } from '@/lib/jwt';

const typeDefs = `
  type User {
    id: ID!
    name: String!
    email: String!
    age: Int
    gender: String
    occupation: String
    incomeRange: String
    accountNumber: String!
    balance: Float!
    beneficiaries: [String!]!
    createdAt: String!
    updatedAt: String!
  }

  type Transaction {
    id: ID!
    fromAccount: String
    toAccount: String
    amount: Float!
    type: String!
    timestamp: String!
    description: String
    reported: Boolean
    reportReason: String
    reportedAt: String
    createdAt: String!
    updatedAt: String!
  }

  type SignupResponse {
    user: User!
    token: String!
    message: String!
  }

  type LoginResponse {
    user: User!
    token: String!
    message: String!
  }

  type TransferResponse {
    success: Boolean!
    message: String!
    transaction: Transaction
    senderBalance: Float
    receiverBalance: Float
  }

  type AddMoneyResponse {
    success: Boolean!
    message: String!
    transaction: Transaction
    newBalance: Float!
  }

  type Query {
    getUserDetails: User!
    getTransactions: [Transaction!]!
    lookupRecipient(accountNumber: String!): User
  }

  type Mutation {
    signupUser(
      name: String!
      email: String!
      password: String!
      age: Int
      gender: String
      occupation: String
      incomeRange: String
    ): SignupResponse!
    
    loginUser(email: String!, password: String!): LoginResponse!
    
    addMoney(amount: Float!): AddMoneyResponse!
    
    sendMoney(receiverAccountNumber: String!, amount: Float!, description: String): TransferResponse!

    reportTransaction(transactionId: ID!, reason: String!): Boolean!
  }
`;

// Helper: derive minimal user identity from JWT only (no DB calls here)
type MinimalUser = { _id: string; accountNumber: string } | null;
function getUserFromToken(token: string | null): MinimalUser {
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  return { _id: payload.userId, accountNumber: payload.accountNumber };
}

// Helper function to extract token from request
function getTokenFromRequest(req: MicroRequest): string | null {
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

const resolvers = {
  Query: {
    getUserDetails: async (_: any, __: any, context: { user: IUser | null }) => {
      await connectToDatabase();
      
      if (!context.user) {
        throw new Error('Authentication required');
      }
      
      const user = await User.findById(context.user._id);
      if (!user) {
        throw new Error('User not found');
      }
      
      return user;
    },
    
    getTransactions: async (_: any, __: any, context: { user: IUser | null }) => {
      await connectToDatabase();
      
      if (!context.user) {
        throw new Error('Authentication required');
      }
      
      // Only show:
      // - debits that the user SENT (fromAccount = user)
      // - credits that the user RECEIVED (toAccount = user)
      const transactions = await Transaction.find({
        $or: [
          { fromAccount: context.user.accountNumber, type: 'debit' },
          { toAccount: context.user.accountNumber, type: 'credit' }
        ]
      }).sort({ timestamp: -1 });
      
      return transactions;
    },
    
    lookupRecipient: async (_: any, { accountNumber }: { accountNumber: string }) => {
      await connectToDatabase();
      const user = await User.findOne({ accountNumber });
      return user || null;
    },
  },
  
  Mutation: {
    signupUser: async (
      _: any,
      {
        name,
        email,
        password,
        age,
        gender,
        occupation,
        incomeRange,
      }: {
        name: string;
        email: string;
        password: string;
        age?: number;
        gender?: string;
        occupation?: string;
        incomeRange?: string;
      }
    ) => {
      await connectToDatabase();
      
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create new user (account number and balance will be auto-generated)
      const user = new User({
        name,
        email,
        password,
        age,
        gender,
        occupation,
        incomeRange,
      });

      await user.save();

      // Generate JWT token
      const token = generateToken({
        userId: String(user._id),
        email: user.email,
        accountNumber: user.accountNumber,
      });

      return {
        user,
        token,
        message: 'Account created successfully',
      };
    },
    
    loginUser: async (
      _: any,
      { email, password }: { email: string; password: string }
    ) => {
      await connectToDatabase();
      
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        throw new Error('Invalid email or password');
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Generate JWT token
      const token = generateToken({
        userId: String(user._id),
        email: user.email,
        accountNumber: user.accountNumber,
      });

      return {
        user,
        token,
        message: 'Login successful',
      };
    },
    
    addMoney: async (
      _: any,
      { amount }: { amount: number },
      context: { user: IUser | null }
    ) => {
      await connectToDatabase();
      
      if (!context.user) {
        throw new Error('Authentication required');
      }

      if (amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      const user = await User.findById(context.user._id);
      if (!user) {
        throw new Error('User not found');
      }

      // Update balance
      user.balance += amount;
      await user.save();

      // Create transaction record (credit) — only toAccount is required
      const transaction = new Transaction({
        toAccount: user.accountNumber,
        amount,
        type: 'credit',
        description: `Added ₦${amount.toLocaleString()}`,
      });

      await transaction.save();

      return {
        success: true,
        message: `Successfully added ₦${amount.toLocaleString()}`,
        transaction,
        newBalance: user.balance,
      };
    },
    
    sendMoney: async (
      _: any,
      {
        receiverAccountNumber,
        amount,
        description,
      }: {
        receiverAccountNumber: string;
        amount: number;
        description?: string;
      },
      context: { user: IUser | null }
    ) => {
      await connectToDatabase();
      
      if (!context.user) {
        throw new Error('Authentication required');
      }

      if (amount <= 0) {
        return {
          success: false,
          message: 'Amount must be greater than 0',
          transaction: null,
        };
      }

      // Validate account numbers start with BSA-
      const bankCode = process.env.NEXT_PUBLIC_BANK_CODE || 'BSA';
      if (!receiverAccountNumber.startsWith(`${bankCode}-`)) {
        return {
          success: false,
          message: 'Transfers are only allowed between accounts in the same bank (BSA)',
          transaction: null,
        };
      }

      // Find both users
      const sender = await User.findById(context.user._id);
      const receiver = await User.findOne({ accountNumber: receiverAccountNumber });

      if (!sender) {
        return {
          success: false,
          message: 'Sender account not found',
          transaction: null,
        };
      }

      if (!receiver) {
        return {
          success: false,
          message: 'Receiver account not found',
          transaction: null,
        };
      }

      if (sender.accountNumber === receiver.accountNumber) {
        return {
          success: false,
          message: 'Cannot transfer money to the same account',
          transaction: null,
        };
      }

      // Check balance
      if (sender.balance < amount) {
        return {
          success: false,
          message: 'Insufficient balance',
          transaction: null,
        };
      }

      try {
        // Perform transfer in a transaction
        const session = await User.startSession();
        session.startTransaction();

        try {
          // Update balances
          sender.balance -= amount;
          receiver.balance += amount;

          await sender.save({ session });
          await receiver.save({ session });

          // Add receiver to sender's beneficiaries if not already there
          if (!sender.beneficiaries) {
            sender.beneficiaries = [];
          }
          if (!sender.beneficiaries.includes(receiver.accountNumber)) {
            sender.beneficiaries.push(receiver.accountNumber);
            await sender.save({ session });
          }

      // Create transaction records (both include from/to)
          const debitTransaction = new Transaction({
            fromAccount: sender.accountNumber,
            toAccount: receiver.accountNumber,
            amount,
            type: 'debit',
            description: description || `Transfer to ${receiver.name}`,
          });

          // Credit entry should only belong to receiver (avoid showing as sender's entry)
          const creditTransaction = new Transaction({
            fromAccount: sender.accountNumber,
            toAccount: receiver.accountNumber,
            amount,
            type: 'credit',
            description: description || `Transfer from ${sender.name}`,
          });

          await debitTransaction.save({ session });
          await creditTransaction.save({ session });

          await session.commitTransaction();
          session.endSession();

          return {
            success: true,
            message: 'Transfer completed successfully',
            transaction: debitTransaction,
            senderBalance: sender.balance,
            receiverBalance: receiver.balance,
          };
        } catch (error) {
          await session.abortTransaction();
          session.endSession();
          throw error;
        }
      } catch (error: any) {
        return {
          success: false,
          message: error.message || 'Transfer failed',
          transaction: null,
        };
      }
    },

    reportTransaction: async (
      _: any,
      { transactionId, reason }: { transactionId: string; reason: string },
      context: { user: { _id: string; accountNumber: string } | null }
    ) => {
      await connectToDatabase();
      if (!context.user) {
        throw new Error('Authentication required');
      }
      const tx = await Transaction.findById(transactionId);
      if (!tx) {
        throw new Error('Transaction not found');
      }
      // Only participants can report
      const acct = context.user.accountNumber;
      const isParticipant = tx.fromAccount === acct || tx.toAccount === acct;
      if (!isParticipant) {
        throw new Error('Not authorized to report this transaction');
      }
      if (tx.reported) {
        return true; // already reported
      }
      tx.reported = true;
      tx.reportReason = reason?.trim().slice(0, 500) || 'Reported';
      tx.reportedAt = new Date();
      await tx.save();
      return true;
    },
  },
};

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

const apolloServer = new ApolloServer({
  schema,
  context: async ({ req }: { req: MicroRequest }) => {
    const token = getTokenFromRequest(req);
    // Avoid DB calls here to prevent 500s due to env/connection issues
    const user = getUserFromToken(token);
    return { user };
  },
  formatError: (formattedError) => {
    // Hide internal stack details while preserving messages
    return {
      message: formattedError.message,
      locations: formattedError.locations,
      path: formattedError.path,
      extensions: {
        code: formattedError.extensions?.code,
      },
    } as any;
  },
});

const startServer = apolloServer.start();

export default async function handler(req: MicroRequest, res: ServerResponse) {
  await startServer;
  await apolloServer.createHandler({
    path: '/api/graphql',
  })(req, res);
}

export const config = {
  api: {
    bodyParser: false,
  },
};
