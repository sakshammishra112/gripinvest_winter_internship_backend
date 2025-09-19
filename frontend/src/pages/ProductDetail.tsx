import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { ArrowLeft, DollarSign } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  investmentType: 'fd' | 'bond' | 'mf' | 'etf' | 'other';
  tenureMonths: number;
  annualYield: number;
  riskLevel: 'low' | 'moderate' | 'high';
  minInvestment: number;
  maxInvestment: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [investmentAmount, setInvestmentAmount] = useState('');

  useEffect(() => {
    if (id) {
      loadProduct(id);
    }
  }, [id]);

  const loadProduct = async (productId: string) => {
    try {
      console.log('Fetching product with ID:', productId);
      const data = await apiService.getProduct(productId);
      console.log('Product data received:', data);
      if (data) {
        setProduct(data);
      } else {
        console.error('No product data received');
        setProduct(null);
      }
    } catch (error) {
      console.error('Error loading product:', error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'etf': return 'ETF';
      case 'fd': return 'Fixed Deposit';
      case 'bond': return 'Bond';
      case 'mf': return 'Mutual Fund';
      default: return 'Other';
    }
  };

  const handleInvest = () => {
    if (product && investmentAmount) {
      navigate('/investments', { 
        state: { 
          productId: product.id, 
          productName: product.name,
          amount: parseFloat(investmentAmount)
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
          <button
            onClick={() => navigate('/products')}
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Products
        </button>
        
        {!product ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Product not found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Product Header */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                      <div className="flex items-center mt-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(product.riskLevel)}`}>
                          {product.riskLevel.charAt(0).toUpperCase() + product.riskLevel.slice(1)} Risk
                        </span>
                        <span className="ml-3 text-gray-500">{getTypeName(product.investmentType)}</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-6 w-6 text-green-500" />
                      <span className="ml-1 text-gray-700 font-medium">
                        {product.annualYield}% APY
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">About {product.name}</h2>
                  <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
                  
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-md font-semibold text-gray-900 mb-3">Why Invest?</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Competitive {product.annualYield}% annual yield</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Flexible investment amount from ${product.minInvestment.toLocaleString()} {product.maxInvestment ? `to $${product.maxInvestment.toLocaleString()}` : 'and above'}</span>
                      </li>
                      <li className="flex items-start">
                        <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{product.tenureMonths}-month tenure with predictable returns</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Investment Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-8">
                  <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Invest Now</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                          Investment Amount
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                          <input
                            type="number"
                            id="amount"
                            value={investmentAmount}
                            onChange={(e) => setInvestmentAmount(e.target.value)}
                            min={product.minInvestment}
                            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder={product.minInvestment.toString()}
                          />
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          Minimum investment: ${product.minInvestment.toLocaleString()}
                        </p>
                      </div>

                      {investmentAmount && parseFloat(investmentAmount) >= product.minInvestment && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h3 className="font-semibold text-blue-900 mb-2">Investment Summary</h3>
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-blue-700">Amount:</span>
                              <span className="font-semibold">${parseFloat(investmentAmount).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-blue-700">Expected Annual Return:</span>
                              <span className="font-semibold text-green-600">
                                ${((parseFloat(investmentAmount) * product.annualYield) / 100).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      <button
                        onClick={handleInvest}
                        disabled={!investmentAmount || parseFloat(investmentAmount) < product.minInvestment}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-semibold"
                      >
                        Invest Now
                      </button>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Investment Details</h2>
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Minimum Investment</span>
                            <span className="font-medium">${product.minInvestment.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Maximum Investment</span>
                            <span className="font-medium">${product.maxInvestment ? product.maxInvestment.toLocaleString() : 'No limit'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Annual Yield</span>
                            <span className="font-medium text-green-600">{product.annualYield}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Tenure</span>
                            <span className="font-medium">{product.tenureMonths} months</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Last Updated</span>
                            <span className="font-medium">{new Date(product.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;