import React, { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp, Shield, Clock, ArrowRight, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../utils/api';
import { InvestmentProduct } from '../../types';

export const ProductsList: React.FC = () => {
  const [products, setProducts] = useState<InvestmentProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<InvestmentProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedRisk, setSelectedRisk] = useState('');
  const [aiRecommendation, setAiRecommendation] = useState('');
  const [showRecommendation, setShowRecommendation] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedType, selectedRisk]);

  const fetchProducts = async () => {
    try {
      const data = await apiClient.getProducts();
      setProducts(data);
      setFilteredProducts(data);
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType) {
      filtered = filtered.filter(product => product.productType === selectedType);
    }

    if (selectedRisk) {
      filtered = filtered.filter(product => product.riskLevel === selectedRisk);
    }

    setFilteredProducts(filtered);
  };

  const getAIRecommendations = async (risk: 'low' | 'moderate' | 'high') => {
    try {
      const recommendation = await apiClient.getProductRecommendations(risk);
      setAiRecommendation(recommendation);
      setShowRecommendation(true);
    } catch (err) {
      console.error('Failed to get AI recommendations:', err);
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const uniqueTypes = [...new Set(products.map(p => p.productType))];
  const riskLevels = ['low', 'moderate', 'high'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Investment Products</h1>
          <p className="mt-1 text-gray-600">Discover and invest in our curated selection of investment products</p>
        </div>

        {/* AI Recommendations Button */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Get AI Recommendations:</span>
          </div>
          {riskLevels.map(risk => (
            <button
              key={risk}
              onClick={() => getAIRecommendations(risk as 'low' | 'moderate' | 'high')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${getRiskColor(risk)} hover:opacity-80`}
            >
              {risk} Risk
            </button>
          ))}
        </div>

        {/* AI Recommendation Display */}
        {showRecommendation && aiRecommendation && (
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
                  <p className="text-sm text-gray-600">Personalized product suggestions for you</p>
                </div>
              </div>
              <button
                onClick={() => setShowRecommendation(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-gray-800 leading-relaxed">{aiRecommendation}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="">All Types</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>{type.replace('_', ' ').toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={selectedRisk}
                onChange={(e) => setSelectedRisk(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
              >
                <option value="">All Risk Levels</option>
                {riskLevels.map(risk => (
                  <option key={risk} value={risk}>{risk}</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedType('');
                setSelectedRisk('');
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No products found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow p-6 group">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex space-x-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(product.productType)}`}>
                      {product.productType.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRiskColor(product.riskLevel)}`}>
                      {product.riskLevel}
                    </span>
                  </div>
                  {product.isActive && (
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  )}
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {product.name}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">{product.description}</p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-600">Expected Return</span>
                    </div>
                    <span className="font-semibold text-green-600">{product.expectedReturn}%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-600">Maturity Period</span>
                    </div>
                    <span className="font-semibold text-gray-900">{product.maturityPeriod} months</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Minimum Investment</span>
                    <span className="font-semibold text-gray-900">₹{product.minimumInvestment.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Available Units</span>
                    <span className="font-semibold text-gray-900">{product.availableUnits}</span>
                  </div>
                </div>

                <Link
                  to={`/products/${product.id}`}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 group"
                >
                  <span>View Details</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};