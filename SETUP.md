# Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment Variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/bigsamofafrica-bank
   JWT_SECRET=your-random-secret-key-change-this-in-production
   NEXT_PUBLIC_BANK_CODE=BSA
   ```
   
   For MongoDB Atlas, use:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bigsamofafrica-bank
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Open Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Features Implemented

✅ TypeScript configuration  
✅ Next.js 14 with Pages Router  
✅ Tailwind CSS styling  
✅ GraphQL API with Apollo Server Micro  
✅ MongoDB integration with Mongoose  
✅ User model with auto-generated account numbers (BSA- prefix)  
✅ Transaction model with proper indexing  
✅ Account signup functionality  
✅ Money transfer between BSA accounts only  
✅ Account lookup and transaction history  
✅ Modern, responsive UI  

## Project Structure

- `/lib/db.ts` - MongoDB connection handler
- `/lib/apolloClient.ts` - Apollo Client configuration
- `/lib/graphql/types.ts` - GraphQL queries and mutations
- `/models/User.ts` - User Mongoose model with account number generation
- `/models/Transaction.ts` - Transaction Mongoose model
- `/pages/api/graphql.ts` - GraphQL API endpoint
- `/pages/_app.tsx` - Next.js app wrapper with Apollo Provider
- `/pages/index.tsx` - Homepage with full banking UI
- `/styles/globals.css` - Global styles with Tailwind directives

## Notes

- Account numbers are automatically generated with the format: `BSA-XXXXXXXXXX`
- Transfers are only allowed between accounts with the BSA prefix
- All passwords are hashed using bcrypt before storage
- Transactions are stored with status tracking (pending/completed/failed)
- Money transfers use MongoDB transactions for data integrity

