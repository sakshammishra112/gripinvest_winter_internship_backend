import React, { useState, useEffect } from 'react';
import { apiClient } from '../utils/api';
import { Search, Calendar, AlertCircle, CheckCircle, XCircle, Brain } from 'lucide-react';

interface TransactionLog {
  id: string;
  type: 'investment' | 'withdrawal' | 'dividend' | 'fee';
  description: string;
  amount: number;
  status: 'success' | 'pending' | 'failed';
  timestamp: string;
  productName?: string;
  errorMessage?: string;
}

interface ErrorSummary {
  totalErrors: number;
  commonIssues: string[];
  recommendations: string[];
}

const TransactionLogs: React.FC = () => {
  const [logs, setLogs] = useState<TransactionLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<TransactionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [errorSummary] = useState<ErrorSummary | null>(null);
  const [showErrorSummary, setShowErrorSummary] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm, statusFilter, typeFilter, dateFilter]);

  const loadLogs = async () => {
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

      const mapped: TransactionLog[] = (investments || []).map((inv: any) => {
        const prod = productMap[inv.productId];
        const statusRaw = (inv.status || '').toLowerCase();
        const amount = Number(inv.amount ?? 0);
        const minInvestment = Number(prod?.minInvestment ?? 0);
        const maxInvestment = Number(prod?.maxInvestment ?? Infinity);
        
        // Determine status based on investment business rules
        let status: TransactionLog['status'] = 'pending';
        
        if (statusRaw === 'matured' || statusRaw === 'active') {
          // Check if investment meets minimum/maximum requirements
          if (amount >= minInvestment && amount <= maxInvestment) {
            status = 'success';
          } else {
            status = 'failed'; // Amount outside product investment range
          }
        } else if (statusRaw === 'cancelled' || statusRaw === 'failed') {
          status = 'failed';
        } else {
          // For pending investments, check if they meet requirements
          if (amount < minInvestment) {
            status = 'failed'; // Amount too low
          } else if (amount > maxInvestment) {
            status = 'failed'; // Amount exceeds maximum
          } else {
            status = 'pending';
          }
        }
        
        return {
          id: inv.id,
          type: 'investment' as const,
          description: `Investment in ${prod?.name || 'Product'}`,
          amount,
          status,
          timestamp: inv.investedAt || inv.investmentDate || inv.createdAt || new Date().toISOString(),
          productName: prod?.name,
        };
      })
      
      .sort((a, b) => {
        const ta = new Date(a.timestamp).getTime();
        const tb = new Date(b.timestamp).getTime();
        return tb - ta;
      });

      setLogs(mapped);
    } catch (error) {
      console.error('Error loading logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // Removed loadErrorSummary (unused)

  const filterLogs = () => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.productName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(log => log.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(log => log.type === typeFilter);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      if (dateFilter !== 'all') {
        filtered = filtered.filter(log => new Date(log.timestamp) >= filterDate);
      }
    }

    setFilteredLogs(filtered);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'investment':
        return 'text-blue-600 bg-blue-100';
      case 'dividend':
        return 'text-green-600 bg-green-100';
      case 'withdrawal':
        return 'text-orange-600 bg-orange-100';
      case 'fee':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Transaction Logs</h1>
          <p className="text-gray-600 mt-2">Track all your investment activities and transactions</p>
        </div>
        <button
          onClick={() => setShowErrorSummary(!showErrorSummary)}
          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
        >
          <Brain className="h-4 w-4 mr-2" />
          AI Error Summary
        </button>
      </div>

      {/* AI Error Summary */}
      {showErrorSummary && errorSummary && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center mb-4">
            <Brain className="h-6 w-6 text-purple-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">AI Error Analysis</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Common Issues ({errorSummary.totalErrors} total)</h3>
              <ul className="space-y-2">
                {errorSummary.commonIssues.map((issue, index) => (
                  <li key={index} className="flex items-start">
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">AI Recommendations</h3>
              <ul className="space-y-2">
                {errorSummary.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="investment">Investment</option>
            <option value="dividend">Dividend</option>
            <option value="withdrawal">Withdrawal</option>
            <option value="fee">Fee</option>
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
          </select>

          {/* Clear Filters */}
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setTypeFilter('all');
              setDateFilter('all');
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Transaction Logs Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Transaction History ({filteredLogs.length} records)
          </h2>
        </div>

        {filteredLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {log.description}
                        </div>
                        {log.productName && (
                          <div className="text-sm text-gray-500">{log.productName}</div>
                        )}
                        {log.errorMessage && (
                          <div className="text-sm text-red-600 mt-1">
                            Error: {log.errorMessage}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(log.type)}`}>
                        {log.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        log.amount >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {log.amount >= 0 ? '+' : ''}${Math.abs(log.amount).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(log.status)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(log.status)}`}>
                          {log.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || dateFilter !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'Your transaction history will appear here once you start investing.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionLogs;