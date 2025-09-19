import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Shield, Clock, DollarSign, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { apiClient } from '../../utils/api';
import { InvestmentProduct } from '../../types';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<InvestmentProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [investing, setInvesting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct(id);
    }
  }, [id]);

  const fetchProduct = async (productId: string) => {
    try {
      const data = await apiClient.getProductById(productId);
      setProduct(data);
    } catch (err) {
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleInvest = async () => {
    if (!product || !investmentAmount) return;

    const amount = parseFloat(investmentAmount);
    if (amount < product.minimumInvestment) {
      alert(`Minimum investment amount is ₹${product.minimumInvestment.toLocaleString()}`);
      return;
    }

    setInvesting(true);
    try {
      await apiClient.makeInvestment(product.id, amount);
      alert('Investment successful!');
      navigate('/investments');
    } catch (err) {
      alert('Investment failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setInvesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-xl font-semibold">Error loading product</p>
          <p className="text-gray-600 mt-2">{error}</p>
          <button
            onClick={() => navigate('/products')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-600 bg-green-100';
      case 'moderate':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'equity':
        return 'text-blue-600 bg-blue-100';
      case 'fixed_deposit':
        return 'text-green-600 bg-green-100';
      case 'bonds':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const estimatedReturns = investmentAmount 
    ? (parseFloat(investmentAmount) * (product.expectedReturn / 100) * (product.maturityPeriod / 12)).toFixed(0)
    : '0';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/products')}
          className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors mb-6"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Products</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(product.productType)}`}>
                    {product.productType.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(product.riskLevel)}`}>
                    {product.riskLevel} RISK
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {product.isActive ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium text-green-600">Active</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <span className="text-sm font-medium text-red-600">Inactive</span>
                    </>
                  )}
                </div>
              </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">{product.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Expected Return</p>
                  <p className="text-xl font-bold text-green-600">{product.expectedReturn}%</p>
                  <p className="text-xs text-gray-500">per annum</p>
                </div>

                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Maturity Period</p>
                  <p className="text-xl font-bold text-blue-600">{product.maturityPeriod}</p>
                  <p className="text-xs text-gray-500">months</p>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <DollarSign className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Min Investment</p>
                  <p className="text-xl font-bold text-purple-600">₹{product.minimumInvestment.toLocaleString()}</p>
                </div>

                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <Users className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Available Units</p>
                  <p className="text-xl font-bold text-orange-600">{product.availableUnits}</p>
                </div>
              </div>

              {/* Features */}
              {product.features && product.features.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Investment Panel */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Invest Now</h3>
            
            {!product.isActive ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="text-red-600 font-medium">Product Currently Unavailable</span>
                </div>
                <p className="text-red-600 text-sm mt-1">This product is not accepting new investments at the moment.</p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                    Investment Amount (₹)
                  </label>
                  <input
                    type="number"
                    id="amount"
                    value={investmentAmount}
                    onChange={(e) => setInvestmentAmount(e.target.value)}
                    min={product.minimumInvestment}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={`Min: ₹${product.minimumInvestment.toLocaleString()}`}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum investment: ₹{product.minimumInvestment.toLocaleString()}
                  </p>
                </div>

                {investmentAmount && parseFloat(investmentAmount) >= product.minimumInvestment && (
                  <div className="bg-blue-50 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Investment Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Investment Amount:</span>
                        <span className="font-medium">₹{parseFloat(investmentAmount).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expected Returns:</span>
                        <span className="font-medium text-green-600">₹{parseInt(estimatedReturns).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t border-blue-200 pt-2">
                        <span className="text-gray-600">Maturity Value:</span>
                        <span className="font-bold text-blue-600">
                          ₹{(parseFloat(investmentAmount) + parseInt(estimatedReturns)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleInvest}
                  disabled={!investmentAmount || parseFloat(investmentAmount) < product.minimumInvestment || investing}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {investing ? 'Processing Investment...' : 'Invest Now'}
                </button>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Risk Disclaimer</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    All investments are subject to market risks. Past performance does not guarantee future results. 
                    Please read all scheme related documents carefully before investing.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};