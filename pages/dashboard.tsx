import { useEffect, useState } from 'react';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import { Copy, LogOut, Plus, Send, Users, CreditCard, ReceiptText, Settings } from 'lucide-react';
import {
  GET_USER_DETAILS,
  GET_TRANSACTIONS,
  ADD_MONEY,
  SEND_MONEY,
  GET_RECIPIENT,
  REPORT_TRANSACTION,
} from '@/lib/graphql/types';
import { isAuthenticated, removeToken } from '@/lib/auth';
import client from '@/lib/apolloClient';

export default function Dashboard() {
  const router = useRouter();
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [showSendMoney, setShowSendMoney] = useState(false);
  const [amount, setAmount] = useState('');
  const [receiverAccount, setReceiverAccount] = useState('');
  const [recipientInfo, setRecipientInfo] = useState<{ name: string; email: string; accountNumber: string } | null>(null);
  const [recipientError, setRecipientError] = useState<string>('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [router]);

  const { data: userData, loading: userLoading, refetch: refetchUser } = useQuery(
    GET_USER_DETAILS,
    {
      skip: !isAuthenticated(),
      fetchPolicy: 'network-only',
      nextFetchPolicy: 'cache-first',
      onError: (error) => {
        if (error.message.includes('Authentication')) {
          removeToken();
          router.push('/login');
        }
      },
    }
  );

  const { data: transactionsData, loading: transactionsLoading, refetch: refetchTransactions } = useQuery(
    GET_TRANSACTIONS,
    {
      skip: !isAuthenticated(),
      fetchPolicy: 'network-only',
      nextFetchPolicy: 'cache-first',
      onError: (error) => {
        if (error.message.includes('Authentication')) {
          removeToken();
          router.push('/login');
        }
      },
    }
  );

  const [addMoney, { loading: addMoneyLoading }] = useMutation(ADD_MONEY, {
    onCompleted: (data) => {
      setMessage({ type: 'success', text: data.addMoney.message });
      setShowAddMoney(false);
      setAmount('');
      refetchUser();
      refetchTransactions();
      setTimeout(() => setMessage(null), 5000);
    },
    onError: (error) => {
      setMessage({ type: 'error', text: error.message });
      setTimeout(() => setMessage(null), 5000);
    },
  });

  const [sendMoney, { loading: sendMoneyLoading }] = useMutation(SEND_MONEY, {
    onCompleted: (data) => {
      if (data.sendMoney.success) {
        setMessage({ type: 'success', text: data.sendMoney.message });
        setShowSendMoney(false);
        setReceiverAccount('');
        setAmount('');
        setDescription('');
        refetchUser();
        refetchTransactions();
      } else {
        setMessage({ type: 'error', text: data.sendMoney.message });
      }
      setTimeout(() => setMessage(null), 5000);
    },
    onError: (error) => {
      setMessage({ type: 'error', text: error.message });
      setTimeout(() => setMessage(null), 5000);
    },
  });

  const [reportTransaction, { loading: reportLoading }] = useMutation(REPORT_TRANSACTION, {
    onCompleted: () => {
      setMessage({ type: 'success', text: 'Transaction reported. Our team will review it.' });
      refetchTransactions();
      setTimeout(() => setMessage(null), 5000);
    },
    onError: (error) => {
      setMessage({ type: 'error', text: error.message });
      setTimeout(() => setMessage(null), 5000);
    }
  });

  // Lazy query for recipient lookup
  const [fetchRecipient, { loading: recipientLoading }] = useLazyQuery(GET_RECIPIENT, {
    onCompleted: (data) => {
      if (data?.lookupRecipient) {
        setRecipientInfo({
          name: data.lookupRecipient.name,
          email: data.lookupRecipient.email,
          accountNumber: data.lookupRecipient.accountNumber,
        });
        setRecipientError('');
      } else {
        setRecipientInfo(null);
        setRecipientError('No account found for this number');
      }
    },
    onError: () => {
      setRecipientInfo(null);
      setRecipientError('Unable to verify recipient at the moment');
    },
    fetchPolicy: 'network-only',
  });

  // Auto-lookup recipient with simple debounce
  useEffect(() => {
    if (!showSendMoney) return;
    const v = receiverAccount.trim();
    setRecipientError('');
    setRecipientInfo(null);
    if (!v) return;
    const bankCode = process.env.NEXT_PUBLIC_BANK_CODE || 'BSA';
    const valid = v.startsWith(`${bankCode}-`) && v.length >= bankCode.length + 1 + 10;
    const t = setTimeout(() => {
      if (valid) {
        fetchRecipient({ variables: { accountNumber: v } });
      } else {
        setRecipientError(`Enter a valid ${bankCode}-XXXXXXXXXX account number`);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [receiverAccount, showSendMoney, fetchRecipient]);

  const handleLogout = () => {
    removeToken();
    client.clearStore();
    router.push('/');
  };

  const handleAddMoney = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (numAmount <= 0) {
      setMessage({ type: 'error', text: 'Amount must be greater than 0' });
      setTimeout(() => setMessage(null), 5000);
      return;
    }
    addMoney({ variables: { amount: numAmount } });
  };

  const handleSendMoney = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (numAmount <= 0) {
      setMessage({ type: 'error', text: 'Amount must be greater than 0' });
      setTimeout(() => setMessage(null), 5000);
      return;
    }
    if (!receiverAccount.trim()) {
      setMessage({ type: 'error', text: 'Please enter receiver account number' });
      setTimeout(() => setMessage(null), 5000);
      return;
    }
    sendMoney({
      variables: {
        receiverAccountNumber: receiverAccount.trim(),
        amount: numAmount,
        description: description.trim() || undefined,
      },
    });
  };

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!userData?.getUserDetails) {
    return null;
  }

  const user = userData.getUserDetails;
  const transactions = transactionsData?.getTransactions || [];
  const beneficiaries = user.beneficiaries || [];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-slate-900 text-white"><CreditCard className="h-4 w-4" /></span>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-sm text-slate-600">Welcome back, {user.name}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
        {/* Sub navigation */}
        <div className="border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 overflow-x-auto py-2 text-sm">
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-slate-900 text-white"><ReceiptText className="h-4 w-4" />Dashboard</span>
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-slate-700 hover:bg-slate-100 cursor-default"><ReceiptText className="h-4 w-4" />Transactions</span>
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-slate-700 hover:bg-slate-100 cursor-default"><Users className="h-4 w-4" />Beneficiaries</span>
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-slate-700 hover:bg-slate-100 cursor-default"><Settings className="h-4 w-4" />Settings</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message Alert */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Balance Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm mb-2">Current Balance</p>
              <p className="text-4xl sm:text-5xl font-bold text-slate-900">₦{user.balance.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddMoney(true);
                  setShowSendMoney(false);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
              >
                <Plus className="h-4 w-4" /> Add Money
              </button>
              <button
                onClick={() => {
                  setShowSendMoney(true);
                  setShowAddMoney(false);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-300 text-slate-900 font-semibold rounded-lg hover:bg-amber-400 transition-colors shadow-sm"
              >
                <Send className="h-4 w-4" /> Send Money
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Transactions */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><ReceiptText className="h-5 w-5" /> Recent Transactions</h2>
              </div>
              {transactionsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
                  <p className="mt-2 text-slate-600">Loading transactions...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <p>No transactions yet</p>
                  <p className="text-sm mt-2">Your transactions will appear here</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-slate-600">
                        <th className="py-2 pr-4">Date</th>
                        <th className="py-2 pr-4">Description</th>
                        <th className="py-2 pr-4 text-right">Amount (₦)</th>
                        <th className="py-2 pr-4">Type</th>
                        <th className="py-2 pr-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {transactions.map((transaction: any) => {
                        const isCredit = transaction.type === 'credit' && transaction.toAccount === user.accountNumber;
                        const isDebit = transaction.type === 'debit' && transaction.fromAccount === user.accountNumber;
                        const when = (() => {
                          const t = transaction.timestamp || transaction.createdAt;
                          const d = t ? new Date(t) : null;
                          return d && !isNaN(d.getTime())
                            ? d.toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })
                            : '';
                        })();
                        const title = isCredit
                          ? (() => {
                              const desc: string | undefined = transaction.description;
                              const prefix = 'Transfer from ';
                              if (desc && desc.startsWith(prefix)) return `Received from ${desc.substring(prefix.length)}`;
                              return `Received from ${transaction.fromAccount || ''}`.trim();
                            })()
                          : isDebit
                          ? (() => {
                              const desc: string | undefined = transaction.description;
                              const prefix = 'Transfer to ';
                              if (desc && desc.startsWith(prefix)) return `Sent to ${desc.substring(prefix.length)}`;
                              return `Sent to ${transaction.toAccount}`;
                            })()
                          : transaction.description || 'Transaction';
                        return (
                          <tr key={transaction.id} className="text-slate-700">
                            <td className="py-3 pr-4 whitespace-nowrap">{when}</td>
                            <td className="py-3 pr-4">
                              <div className="font-medium text-slate-900">{title}</div>
                              <div className="text-xs text-slate-500">{transaction.description || 'No description'}</div>
                            </td>
                            <td className={`py-3 pr-4 text-right font-semibold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                              {isCredit ? '+' : '-'}{transaction.amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-3 pr-4">
                              <span className={`text-xs px-2 py-1 rounded-full ${isCredit ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {transaction.type.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-3 pr-4">
                              {transaction.reported ? (
                                <span className="text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded-full">Reported</span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const reason = prompt('Describe the issue with this transaction (optional)') || 'Reported by user';
                                    reportTransaction({ variables: { transactionId: transaction.id, reason } });
                                  }}
                                  className="text-xs px-3 py-1 rounded-md border border-slate-200 hover:bg-slate-100"
                                  disabled={reportLoading}
                                >
                                  {reportLoading ? 'Reporting…' : 'Report'}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Info */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Account Details</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-600">Account Number</p>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900">{user.accountNumber}</p>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(user.accountNumber)}
                      className="p-2 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                      title="Copy account number"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Name</p>
                  <p className="font-semibold text-slate-900">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Email</p>
                  <p className="font-semibold text-slate-900">{user.email}</p>
                </div>
                {user.occupation && (
                  <div>
                    <p className="text-sm text-slate-600">Occupation</p>
                    <p className="font-semibold text-slate-900">{user.occupation}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Beneficiaries */}
            {beneficiaries.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5" /> Beneficiaries
                </h2>
                <div className="space-y-2">
                  {beneficiaries.map((accountNumber: string, index: number) => (
                    <div
                      key={index}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <p className="font-medium text-slate-900">{accountNumber}</p>
                      <button
                        onClick={() => {
                          setReceiverAccount(accountNumber);
                          setShowSendMoney(true);
                          setShowAddMoney(false);
                        }}
                        className="text-xs text-slate-700 hover:text-slate-900 hover:underline mt-1"
                      >
                        Send Money
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Money Modal */}
      {showAddMoney && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Add Money</h2>
            <form onSubmit={handleAddMoney}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₦)
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter amount"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={addMoneyLoading}
                  className="flex-1 bg-slate-900 text-white py-3 rounded-lg hover:bg-slate-800 disabled:opacity-50 font-semibold transition-colors"
                >
                  {addMoneyLoading ? 'Processing...' : 'Add Money'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMoney(false);
                    setAmount('');
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Send Money Modal */}
      {showSendMoney && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Send Money</h2>
            <form onSubmit={handleSendMoney}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Receiver Account Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={receiverAccount}
                    onChange={(e) => setReceiverAccount(e.target.value)}
                    className="w-full pr-12 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="BSA-1234567890"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!receiverAccount) return;
                      navigator.clipboard.writeText(receiverAccount);
                    }}
                    title="Copy account"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-md text-gray-500 hover:text-slate-900 hover:bg-gray-100 transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                {/* Recipient info / error */}
                <div className="mt-2 min-h-[24px]">
                  {recipientLoading && (
                    <p className="text-sm text-gray-500">Verifying recipient…</p>
                  )}
                  {!recipientLoading && recipientInfo && (
                    <div className="text-sm text-gray-700 flex items-center gap-2">
                      <span className="font-semibold">Recipient:</span>
                      <span>{recipientInfo.name}</span>
                    </div>
                  )}
                  {!recipientLoading && recipientError && (
                    <p className="text-sm text-red-600">{recipientError}</p>
                  )}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₦)
                </label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter amount"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Payment for..."
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={sendMoneyLoading || !recipientInfo}
                  className="flex-1 bg-slate-900 text-white py-3 rounded-lg hover:bg-slate-800 disabled:opacity-50 font-semibold transition-colors"
                >
                  {sendMoneyLoading ? 'Processing...' : 'Send Money'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSendMoney(false);
                    setReceiverAccount('');
                    setAmount('');
                    setDescription('');
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
