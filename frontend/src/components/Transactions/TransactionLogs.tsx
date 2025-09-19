import React, { useState, useEffect } from 'react';
import { Clock, Filter, Search, Download, AlertCircle, CheckCircle, XCircle, Brain } from 'lucide-react';
import { apiClient } from '../../utils/api';
import { TransactionLog } from '../../types';

export const TransactionLogs: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionLog[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [showAiSummary, setShowAiSummary] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm, statusFilter]);

  const fetchTransactions = async () => {
    try {
      // Fetch investments of the logged-in user and map them to transaction-like entries
      const investments = await apiClient.getInvestmentsOfLoggedUser();

      // Enrich with product names
      const uniqueProductIds = Array.from(new Set((investments || []).map((i: any) => i.productId).filter(Boolean)));
      const productMap: Record<string, any> = {};
      await Promise.all(
        uniqueProductIds.map(async (pid) => {
          try {
            const prod = await apiClient.getProductById(pid);
            productMap[pid] = prod;
          } catch {}
        })
      );

      const mapped = (investments || []).map((inv: any) => {
        const prod = productMap[inv.productId];
        const statusRaw = (inv.status || '').toLowerCase();
        const status = statusRaw === 'matured' ? 'SUCCESS' : statusRaw === 'cancelled' ? 'FAILED' : 'PENDING';
        return {
          id: inv.id,
          userId: inv.userId,
          action: 'INVESTMENT',
          details: `${prod?.name || 'Investment'} • ${statusRaw || 'active'}`,
          amount: Number(inv.amount ?? 0),
          status,
          timestamp: inv.investedAt || inv.investmentDate || inv.createdAt || new Date().toISOString(),
        } as TransactionLog;
      });

      setTransactions(mapped);
      setFilteredTransactions(mapped);
    } catch (err) {
      setError('Failed to load transaction logs');
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.details.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(transaction => transaction.status === statusFilter);
    }

    setFilteredTransactions(filtered);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'text-green-600 bg-green-100';
      case 'FAILED':
        return 'text-red-600 bg-red-100';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const generateAISummary = () => {
    const failedTransactions = transactions.filter(t => t.status === 'FAILED');
    const successRate = ((transactions.filter(t => t.status === 'SUCCESS').length / transactions.length) * 100).toFixed(1);
    
    if (failedTransactions.length === 0) {
      setAiSummary(`Great news! You have a 100% success rate with ${transactions.length} transactions. All your transactions have completed successfully without any issues.`);
    } else {
      const failureRate = ((failedTransactions.length / transactions.length) * 100).toFixed(1);
      const commonIssues = failedTransactions.map(t => t.details).slice(0, 3);
      
      setAiSummary(`Transaction Summary: ${successRate}% success rate (${failureRate}% failed). You have ${failedTransactions.length} failed transactions. Common issues include: ${commonIssues.join(', ')}. Consider reviewing failed transactions and retrying if needed.`);
    }
    
    setShowAiSummary(true);
  };

  const exportTransactions = () => {
    const csvContent = [
      ['Date', 'Action', 'Status', 'Amount', 'Details'],
      ...filteredTransactions.map(t => [
        new Date(t.timestamp).toLocaleString(),
        t.action,
        t.status,
        t.amount || '',
        t.details
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transaction-logs.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Transaction Logs</h1>
          <p className="mt-1 text-gray-600">Monitor all your investment transactions and activities</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600">Successful</p>
              <p className="text-2xl font-bold text-green-600">
                {transactions.filter(t => t.status === 'SUCCESS').length}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-red-600">
                {transactions.filter(t => t.status === 'FAILED').length}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {transactions.filter(t => t.status === 'PENDING').length}
              </p>
            </div>
          </div>
        </div>

        {/* AI Summary Section */}
        <div className="mb-6 flex items-center space-x-4">
          <button
            onClick={generateAISummary}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Brain className="h-5 w-5" />
            <span>AI Error Summary</span>
          </button>
          {filteredTransactions.length > 0 && (
            <button
              onClick={exportTransactions}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-5 w-5" />
              <span>Export CSV</span>
            </button>
          )}
        </div>

        {showAiSummary && aiSummary && (
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">AI Transaction Analysis</h3>
                  <p className="text-sm text-gray-600">Summary of your transaction patterns and issues</p>
                </div>
              </div>
              <button
                onClick={() => setShowAiSummary(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-gray-800 leading-relaxed">{aiSummary}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="">All Status</option>
                <option value="SUCCESS">Success</option>
                <option value="FAILED">Failed</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>

            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Transaction Logs Table */}
        {error ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No transactions found</p>
            <p className="text-gray-500 text-sm">Your transaction history will appear here</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(transaction.status)}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{transaction.action}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={transaction.details}>
                          {transaction.details}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {transaction.amount ? `₹${transaction.amount.toLocaleString()}` : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(transaction.timestamp).toLocaleString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};