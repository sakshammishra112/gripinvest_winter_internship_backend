import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, PieChart, Activity, Brain, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { apiClient } from '../../utils/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell } from 'recharts';

export const Dashboard: React.FC = () => {
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await apiClient.getPortfolioInsights();
      setPortfolioData(data);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600 text-center">
          <p className="text-xl font-semibold">Error loading dashboard</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  const stats = portfolioData?.stats || {
    totalValue: 0,
    totalInvestment: 0,
    totalProfit: 0,
    activeInvestmentsCount: 0,
    maturedInvestmentsCount: 0
  };

  const profitPercentage = stats.totalInvestment > 0 
    ? ((stats.totalProfit / stats.totalInvestment) * 100).toFixed(2)
    : 0;

  const dashboardCards = [
    {
      title: 'Total Portfolio Value',
      value: `₹${stats.totalValue.toLocaleString()}`,
      icon: DollarSign,
      change: `+${profitPercentage}%`,
      isPositive: stats.totalProfit >= 0,
      color: 'text-green-600',
    },
    {
      title: 'Total Investment',
      value: `₹${stats.totalInvestment.toLocaleString()}`,
      icon: TrendingUp,
      change: 'Principal Amount',
      isPositive: true,
      color: 'text-blue-600',
    },
    {
      title: 'Total Profit/Loss',
      value: `₹${stats.totalProfit.toLocaleString()}`,
      icon: Activity,
      change: `${stats.totalProfit >= 0 ? '+' : ''}${profitPercentage}%`,
      isPositive: stats.totalProfit >= 0,
      color: stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600',
    },
    {
      title: 'Active Investments',
      value: stats.activeInvestmentsCount.toString(),
      icon: PieChart,
      change: `${stats.maturedInvestmentsCount} matured`,
      isPositive: true,
      color: 'text-purple-600',
    },
  ];

  // Mock data for charts (in real app, this would come from API)
  const performanceData = [
    { month: 'Jan', value: stats.totalInvestment * 0.8 },
    { month: 'Feb', value: stats.totalInvestment * 0.85 },
    { month: 'Mar', value: stats.totalInvestment * 0.9 },
    { month: 'Apr', value: stats.totalInvestment * 0.95 },
    { month: 'May', value: stats.totalInvestment },
    { month: 'Jun', value: stats.totalValue },
  ];

  const allocationData = [
    { name: 'Equity', value: 40, color: '#3B82F6' },
    { name: 'Fixed Deposit', value: 30, color: '#10B981' },
    { name: 'Bonds', value: 20, color: '#F59E0B' },
    { name: 'Others', value: 10, color: '#EF4444' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Investment Dashboard</h1>
          <p className="mt-1 text-gray-600">Monitor your investment portfolio and performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardCards.map((card, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${card.color.replace('text-', 'bg-').replace('600', '100')}`}>
                    <card.icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                </div>
                <div className={`flex items-center space-x-1 text-sm ${card.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {card.isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  <span>{card.change}</span>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Performance Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Performance</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Portfolio Value']}
                    labelStyle={{ color: '#374151' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Asset Allocation */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Allocation</h3>
            <div className="h-64 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Allocation']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {allocationData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-gray-700">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Insights Card */}
        {portfolioData?.aiInsights && (
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Brain className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">AI Investment Insights</h3>
                <p className="text-sm text-gray-600">Personalized recommendations based on your portfolio</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-gray-800 leading-relaxed">{portfolioData.aiInsights}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const Pie = ({ data, cx, cy, innerRadius, outerRadius, paddingAngle, dataKey, children }: any) => {
  return (
    <g>
      {/* This is a simplified pie chart implementation */}
      {children}
    </g>
  );
};