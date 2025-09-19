import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { apiClient } from '../utils/api';
import { PieChart, TrendingUp, DollarSign, Plus, Brain } from 'lucide-react';

interface Investment {
  id: string;
  productId: string;
  productName?: string;
  amount: number;
  currentValue: number;
  returns?: number;
  type?: string;
  riskLevel?: string;
  investmentDate: string;
  status: 'ACTIVE' | 'MATURED' | 'CANCELLED' | 'PENDING';
}

interface InvestmentFormData {
  productId: string;
  productName: string;
  amount: number;
}

const Investments: React.FC = () => {
  const location = useLocation();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvestForm, setShowInvestForm] = useState(false);
  const [formData, setFormData] = useState<InvestmentFormData>({
    productId: '',
    productName: '',
    amount: 0
  });
  const [aiSummary, setAiSummary] = useState<string>('');
  const [balance, setBalance] = useState<number>(0);
  const [totalReturns, setTotalReturns] = useState<number>(0);

  useEffect(() => {
    loadInvestments();
    loadFinancials();
    if (location.state) {
      const { productId, productName, amount } = location.state as any;
      setFormData({ productId, productName, amount });
      setShowInvestForm(true);
    }
  }, [location.state]);

  const loadInvestments = async () => {
    try {
      const data = (await apiClient.getUserPortfolio()) as any[];
      // Enrich with product details using /api/products/{id}
      const uniqueProductIds = Array.from(new Set((data || []).map((i: any) => i.productId).filter(Boolean)));
      const productMap: Record<string, any> = {};
      await Promise.all(
        uniqueProductIds.map(async (pid) => {
          try {
            const prod = await apiClient.getProductById(pid);
            productMap[pid] = prod;
          } catch {
            // ignore individual product failures
          }
        })
      );

      // Fetch investedAt for each investment (optional best-effort)
      const investedAtMap: Record<string, string> = {};
      await Promise.all(
        (data || []).map(async (inv: any) => {
          try {
            const det = await apiClient.getInvestmentById(inv.id);
            if (det?.investedAt) investedAtMap[inv.id] = det.investedAt;
          } catch {}
        })
      );

      const enriched = (data || []).map((inv: any) => {
        const prod = inv.product || productMap[inv.productId];
        return {
          ...inv,
          productName: inv.productName || prod?.name,
          type: prod?.productType?.replace('_', ' '),
          riskLevel: prod?.riskLevel,
          amount: Number(inv.amount ?? 0),
          currentValue: Number(inv.currentValue ?? 0),
          investmentDate: investedAtMap[inv.id] || inv.investmentDate || inv.investedAt || inv.createdAt || inv.date || '',
        };
      });

      setInvestments(enriched as any);
      generateAISummary(enriched as any);
    } catch (error) {
      console.error('Error loading investments:', error);
      setInvestments([]);
      setAiSummary("You haven't made any investments yet. Consider starting with a balanced portfolio that matches your risk appetite.");
    } finally {
      setLoading(false);
    }
  };

  const loadFinancials = async () => {
    try {
      const [b, tr] = await Promise.all([
        apiClient.getUserBalance(),
        apiClient.getTotalReturns(),
      ]);
      setBalance(b as number);
      setTotalReturns((tr as any)?.totalReturns ?? 0);
    } catch (e) {
      setBalance(0);
      setTotalReturns(0);
    }
  };

  const generateAISummary = (investmentData: Investment[]) => {
    if (investmentData.length === 0) {
      setAiSummary("You haven't made any investments yet. Consider starting with a balanced portfolio that matches your risk appetite.");
      return;
    }

    const totalInvested = investmentData.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const totalCurrent = investmentData.reduce((sum, inv) => sum + (inv.currentValue || 0), 0);
    const returns = totalCurrent - totalInvested;
    const returnPercentage = totalInvested > 0 ? ((returns / totalInvested) * 100).toFixed(1) : '0.0';

    let summary = `Your portfolio return is ${returnPercentage}%. `;
    summary += returns >= 0 ? 'Good steady growth.' : 'Consider reviewing underperforming investments.';

    setAiSummary(summary);
  };

  const handleInvestment = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await apiClient.makeInvestment(formData.productId, formData.amount);
      await loadInvestments();
      setFormData({ productId: '', productName: '', amount: 0 });
      setShowInvestForm(false);
      alert('Investment successful!');
    } catch (error) {
      console.error('Error creating investment:', error);
      alert('Investment failed. Please try again.');
    }
  };

  const totalPortfolioValue = balance;
  const totalInvested = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);

  const portfolioStats = [
    {
      name: 'Total Portfolio Value',
      value: `$${totalPortfolioValue.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: 'Total Returns',
      value: `$${totalReturns.toLocaleString()}`,
      icon: TrendingUp,
      color: totalReturns >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: totalReturns >= 0 ? 'bg-green-100' : 'bg-red-100'
    },
    {
      name: 'Return Percentage',
      value: totalInvested > 0 ? `${((totalReturns / totalInvested) * 100).toFixed(1)}%` : '0%',
      icon: PieChart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getRiskBadgeClass = (risk?: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-700';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-700';
      case 'high':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Investments</h1>
          <p className="text-gray-600 mt-2">Track and manage your investment portfolio</p>
        </div>
        <button
          onClick={() => setShowInvestForm(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Investment
        </button>
      </div>

      {/* Portfolio Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {portfolioStats.map((stat) => {
          const Icon = stat.icon as any;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className={`${stat.bgColor} rounded-lg p-3`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* AI Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Brain className="h-6 w-6 text-purple-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">AI Portfolio Summary</h2>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-purple-800 text-sm leading-relaxed">{aiSummary}</p>
            </div>
          </div>
        </div>

        {/* Investments List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Investment Portfolio</h2>
            {investments.length > 0 ? (
              <div className="space-y-4">
                {investments.map((investment) => (
                  <div key={investment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900">{investment.productName || 'Investment Product'}</h3>
                          {investment.riskLevel && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRiskBadgeClass(investment.riskLevel)}`}>
                              {investment.riskLevel.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{investment.type || ''}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {(() => {
                            const d = investment.investmentDate ? new Date(investment.investmentDate) : null;
                            const valid = d && !isNaN(d.getTime());
                            return valid ? `Invested on ${d.toLocaleDateString()}` : '';
                          })()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ${investment.currentValue?.toLocaleString?.() || 0}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Invested:</span>
                        <p className="font-medium">${(investment.amount || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <p className="font-medium">{investment.status}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Date:</span>
                        <p className="font-medium">
                          {(() => {
                            const d = investment.investmentDate ? new Date(investment.investmentDate) : null;
                            const valid = d && !isNaN(d.getTime());
                            return valid ? d.toLocaleDateString() : '-';
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No investments yet</h3>
                <p className="text-gray-600 mb-4">Start building your portfolio today</p>
                <button
                  onClick={() => setShowInvestForm(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Make Your First Investment
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Investment Form Modal */}
      {showInvestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">New Investment</h2>
            <form onSubmit={handleInvestment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product ID
                </label>
                <input
                  type="text"
                  value={formData.productId}
                  onChange={(e) => setFormData(prev => ({ ...prev, productId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter product ID"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Investment Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                    min="1"
                    required
                  />
                </div>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInvestForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Invest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Investments;