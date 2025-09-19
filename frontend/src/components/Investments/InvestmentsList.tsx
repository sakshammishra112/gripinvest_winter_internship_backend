import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, DollarSign, Activity, ArrowUpRight, ArrowDownRight, Brain, Filter } from 'lucide-react';
import { apiClient } from '../../utils/api';
import { Investment } from '../../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export const InvestmentsList: React.FC = () => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [portfolioInsights, setPortfolioInsights] = useState<any>(null);

  useEffect(() => {
    fetchInvestments();
    fetchPortfolioInsights();
  }, []);

  const fetchInvestments = async () => {
    try {
      const data = await apiClient.getUserPortfolio();
      setInvestments(data);
    } catch (err) {
      setError('Failed to load investments');
    } finally {
      setLoading(false);
    }
  };

  const fetchPortfolioInsights = async () => {
    try {
      const data = await apiClient.getPortfolioInsights();
      setPortfolioInsights(data);
    } catch (err) {
      console.error('Failed to load portfolio insights:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const filteredInvestments = filterStatus 
    ? investments.filter(inv => inv.status === filterStatus)
    : investments;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-600 bg-green-100';
      case 'MATURED':
        return 'text-blue-600 bg-blue-100';
      case 'CANCELLED':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-600';
      case 'moderate':
        return 'text-yellow-600';
      case 'high':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Chart data
  const statusData = [
    { name: 'Active', value: investments.filter(i => i.status === 'ACTIVE').length, color: '#10B981' },
    { name: 'Matured', value: investments.filter(i => i.status === 'MATURED').length, color: '#3B82F6' },
    { name: 'Cancelled', value: investments.filter(i => i.status === 'CANCELLED').length, color: '#EF4444' },
  ].filter(item => item.value > 0);

  const performanceData = investments
    .filter(inv => inv.status === 'ACTIVE')
    .map(inv => ({
      name: inv.product?.name?.substring(0, 15) + '...' || 'Investment',
      invested: inv.amount,
      current: inv.currentValue,
      profit: inv.currentValue - inv.amount,
    }));

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalCurrent = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalProfit = totalCurrent - totalInvested;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Investments</h1>
          <p className="mt-1 text-gray-600">Track and manage your investment portfolio</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className={`flex items-center space-x-1 text-sm ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalProfit >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                <span>{totalInvested > 0 ? (((totalProfit / totalInvested) * 100).toFixed(2)) : 0}%</span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600">Total Invested</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalInvested.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600">Current Value</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalCurrent.toLocaleString()}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg ${totalProfit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <Activity className={`h-6 w-6 ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600">Total P&L</p>
              <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalProfit >= 0 ? '+' : ''}₹{totalProfit.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600">Active Investments</p>
              <p className="text-2xl font-bold text-gray-900">
                {investments.filter(inv => inv.status === 'ACTIVE').length}
              </p>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Status Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-4 mt-4">
              {statusData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-700">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Investments Performance</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" />
                  <Tooltip formatter={(value: any) => [`₹${value.toLocaleString()}`, '']} />
                  <Bar dataKey="invested" fill="#94A3B8" name="Invested" />
                  <Bar dataKey="current" fill="#3B82F6" name="Current Value" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* AI Insights */}
        {portfolioInsights?.aiInsights && (
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Portfolio AI Summary</h3>
                <p className="text-sm text-gray-600">Insights and recommendations for your investments</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-gray-800 leading-relaxed">{portfolioInsights.aiInsights}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filter by status:</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilterStatus('')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  filterStatus === '' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {['ACTIVE', 'MATURED', 'CANCELLED'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${getStatusColor(status)} ${
                    filterStatus === status ? 'ring-2 ring-blue-300' : 'hover:opacity-80'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Investments List */}
        {error ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        ) : filteredInvestments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No investments found</p>
            <p className="text-gray-500 text-sm">Start investing to see your portfolio here</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Investment Details</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P&L</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInvestments.map((investment) => {
                    const profit = investment.currentValue - investment.amount;
                    const profitPercentage = ((profit / investment.amount) * 100).toFixed(2);
                    
                    return (
                      <tr key={investment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {investment.product?.name || 'Investment Product'}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center space-x-2">
                              <span>{investment.product?.productType?.replace('_', ' ')}</span>
                              <span className={`font-medium ${getRiskColor(investment.product?.riskLevel || 'MEDIUM')}`}>
                                {investment.product?.riskLevel}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">₹{investment.amount.toLocaleString()}</div>
                          <div className="text-sm text-gray-500">{investment.units} units</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ₹{investment.currentValue.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {profit >= 0 ? '+' : ''}₹{profit.toLocaleString()}
                          </div>
                          <div className={`text-xs ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ({profit >= 0 ? '+' : ''}{profitPercentage}%)
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(investment.status)}`}>
                            {investment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>Invested: {new Date(investment.investmentDate).toLocaleDateString()}</div>
                          <div>Maturity: {new Date(investment.maturityDate).toLocaleDateString()}</div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};