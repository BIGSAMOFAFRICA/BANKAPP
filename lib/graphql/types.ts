import { gql } from '@apollo/client';

export const GET_USER_DETAILS = gql`
  query GetUserDetails {
    getUserDetails {
      id
      name
      email
      age
      gender
      occupation
      incomeRange
      accountNumber
      balance
      beneficiaries
      createdAt
      updatedAt
    }
  }
`;

export const GET_TRANSACTIONS = gql`
  query GetTransactions {
    getTransactions {
      id
      fromAccount
      toAccount
      amount
      type
      timestamp
      description
      reported
      reportReason
      reportedAt
      createdAt
      updatedAt
    }
  }
`;

export const GET_RECIPIENT = gql`
  query GetRecipient($accountNumber: String!) {
    lookupRecipient(accountNumber: $accountNumber) {
      id
      name
      email
      accountNumber
    }
  }
`;

export const SIGNUP_USER = gql`
  mutation SignupUser(
    $name: String!
    $email: String!
    $password: String!
    $age: Int
    $gender: String
    $occupation: String
    $incomeRange: String
  ) {
    signupUser(
      name: $name
      email: $email
      password: $password
      age: $age
      gender: $gender
      occupation: $occupation
      incomeRange: $incomeRange
    ) {
      user {
        id
        name
        email
        accountNumber
        balance
      }
      token
      message
    }
  }
`;

export const LOGIN_USER = gql`
  mutation LoginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      user {
        id
        name
        email
        accountNumber
        balance
      }
      token
      message
    }
  }
`;

export const ADD_MONEY = gql`
  mutation AddMoney($amount: Float!) {
    addMoney(amount: $amount) {
      success
      message
      newBalance
      transaction {
        id
        amount
        type
        description
        timestamp
      }
    }
  }
`;

export const SEND_MONEY = gql`
  mutation SendMoney($receiverAccountNumber: String!, $amount: Float!, $description: String) {
    sendMoney(receiverAccountNumber: $receiverAccountNumber, amount: $amount, description: $description) {
      success
      message
      transaction {
        id
        fromAccount
        toAccount
        amount
        type
        description
        timestamp
      }
      senderBalance
      receiverBalance
    }
  }
`;

export const REPORT_TRANSACTION = gql`
  mutation ReportTransaction($transactionId: ID!, $reason: String!) {
    reportTransaction(transactionId: $transactionId, reason: $reason)
  }
`;

// Legacy exports for backward compatibility (if needed)
export const GET_USER = GET_USER_DETAILS;
export const SIGNUP = SIGNUP_USER;
export const TRANSFER_MONEY = SEND_MONEY;
