import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { Search, Filter, Star, TrendingUp, Shield, DollarSign, Brain, X, Plus, Trash2 } from 'lucide-react';

// Match the Java enums exactly
type InvestmentType = 'bond' | 'fd' | 'mf' | 'etf' | 'other';
type RiskLevel = 'low' | 'moderate' | 'high';

interface Product {
  id: string;
  name: string;
  investmentType: InvestmentType;
  tenureMonths: number;
  annualYield: number;
  riskLevel: RiskLevel;
  minInvestment: number;
  maxInvestment?: number;
  description: string;
  createdAt?: string;
  updatedAt?: string;
  // For backward compatibility
  type?: string;
  productType?: string;
  expectedYield?: number;
  minimumInvestment?: number;
  rating?: number;
}

const Products: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedRisk, setSelectedRisk] = useState('all');
  const [recommendations, setRecommendations] = useState<string>('');
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [selectedRiskForRecommendation, setSelectedRiskForRecommendation] = useState<string>('');
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    investmentType: 'fd',
    tenureMonths: 0,
    annualYield: 0,
    riskLevel: 'low',
    minInvestment: 0,
    maxInvestment: undefined,
  });

  // Helper function to handle number input changes
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Convert empty string to undefined, otherwise parse as float
    const numValue = value === '' ? undefined : parseFloat(value);
    setNewProduct(prev => ({
      ...prev,
      [name]: isNaN(numValue as number) ? undefined : numValue
    }));
  };
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadProducts();
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (user) {
      setIsAdmin(user.role === 'ADMIN');
    }
  }, [user]);

  const checkAdminStatus = async () => {
    try {
      const userData = await apiClient.getUserDetails();
      setIsAdmin(userData.role === 'ADMIN');
    } catch (error: unknown) {
      console.error('Error checking admin status:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
    }
  };

  useEffect(() => {
    // Filter products based on search and filters
    let filtered = [...products];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(term) || 
        (p.description && p.description.toLowerCase().includes(term))
      );
    }
    
    if (selectedType !== 'all') {
      filtered = filtered.filter(p => p.investmentType === selectedType);
    }
    
    if (selectedRisk !== 'all') {
      filtered = filtered.filter(p => p.riskLevel === selectedRisk);
    }
    
    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedType, selectedRisk]);

  const loadProducts = async () => {
    try {
      const data = await apiClient.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // Prepare the product data in the exact format expected by the API
      const productData: {
        name: string;
        investmentType: InvestmentType;
        tenureMonths: number;
        annualYield: number;
        riskLevel: RiskLevel;
        minInvestment: number;
        description: string;
        maxInvestment?: number;
      } = {
        name: newProduct.name?.trim() || '',
        investmentType: (newProduct.investmentType as InvestmentType) || 'fd',
        tenureMonths: newProduct.tenureMonths ? Number(newProduct.tenureMonths) : 0,
        annualYield: newProduct.annualYield ? Number(newProduct.annualYield) : 0,
        riskLevel: (newProduct.riskLevel as RiskLevel) || 'low',
        minInvestment: newProduct.minInvestment ? Number(newProduct.minInvestment) : 0,
        description: newProduct.description?.trim() || ''
      };
      
      // Only include maxInvestment if it has a value
      if (newProduct.maxInvestment && Number(newProduct.maxInvestment) > 0) {
        productData.maxInvestment = Number(newProduct.maxInvestment);
      }

      console.log('Sending product data:', productData);
      
      const createdProduct = await apiClient.addProduct(productData);
      console.log('Product created successfully:', createdProduct);
      
      setShowAddProductModal(false);
      setNewProduct({
        name: '',
        description: '',
        investmentType: 'fd',
        tenureMonths: 12,
        annualYield: 5.5,
        riskLevel: 'moderate',
        minInvestment: 1000,
        maxInvestment: 1000000,
      });
      
      await loadProducts();
    } catch (error: unknown) {
      console.error('Error adding product:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to add product';
      alert(`Failed to add product: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await apiClient.deleteProduct(id);
        // Show success message
        alert('Product deleted successfully!');
        // Refresh the products list
        await loadProducts();
      } catch (error: unknown) {
        console.error('Error deleting product:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete product';
        alert(`Failed to delete product: ${errorMessage}`);
      }
    }
  };

  const handleRecommendClick = () => {
    setShowRiskModal(true);
  };

  const loadRecommendations = async (risk: string) => {
    try {
      setSelectedRiskForRecommendation(risk);
      setLoadingRecommendations(true);
      console.log('Fetching recommendations for risk:', risk.toLowerCase());
      const response = await apiClient.getProductRecommendations(risk.toLowerCase());
      console.log('API Response:', response);
      
      // Handle different response types
      let recommendationText = '';
      if (typeof response === 'string') {
        recommendationText = response;
      } else if (response && typeof response === 'object') {
        // If it's an object, try to extract the text
        recommendationText = response.message || response.text || response.recommendation || JSON.stringify(response);
      } else {
        recommendationText = String(response);
      }
      
      setRecommendations(recommendationText);
      setShowRiskModal(false);
    } catch (error) {
      console.error('Error loading recommendations:', error);
      console.error('Error details:', error);
      alert(`Failed to load recommendations: ${error.message || 'Unknown error'}`);
    } finally {
      setLoadingRecommendations(false);
      setSelectedRiskForRecommendation('');
    }
  };



  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'fd': return Shield;
      case 'bond': return TrendingUp;
      case 'mf': return TrendingUp;
      case 'etf': return TrendingUp;
      case 'other': return Star;
      case 'Equity': return TrendingUp; // For backward compatibility
      case 'Fixed Income': return Shield; // For backward compatibility
      case 'Real Estate': return DollarSign; // For backward compatibility
      default: return Star;
    }
  };

  const getTypeDisplayName = (type: InvestmentType | string) => {
    switch (type) {
      case 'fd': return 'fd';
      case 'bond': return 'bond';
      case 'mf': return 'mf';
      case 'etf': return 'etf';
      case 'other': return 'other';
      default: return type; // For backward compatibility
    }
  };

  const formatRecommendations = (text: string) => {
    // Try both **Product Name** and *Product Name* patterns
    let sections = text.split(/\*\*(.*?)\*\*/);
    
    // If no double asterisks found, try single asterisks
    if (sections.length <= 1) {
      sections = text.split(/\*(.*?)\*/);
    }
    
    if (sections.length <= 1) {
      // If no asterisk sections found, return as plain text
      return <p className="text-gray-700">{text}</p>;
    }

    const elements: JSX.Element[] = [];
    let currentIndex = 0;

    // Process each section
    for (let i = 0; i < sections.length; i += 2) {
      const productName = sections[i + 1];
      const description = sections[i + 2] || '';

      if (productName && productName.trim()) {
        // Add description before product name (if exists)
        if (sections[i] && sections[i].trim()) {
          elements.push(
            <p key={`desc-${currentIndex}`} className="text-gray-700 mb-4 break-words overflow-wrap-anywhere">
              {sections[i].trim()}
            </p>
          );
        }

        // Add product recommendation card
        elements.push(
          <div key={`product-${currentIndex}`} className="bg-white rounded-lg p-4 mb-4 border border-purple-200 shadow-sm max-w-full overflow-hidden">
            <div className="flex items-center mb-3">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-3 flex-shrink-0"></div>
              <h3 className="text-lg font-semibold text-gray-900 break-words">{productName.trim()}</h3>
            </div>
            <p className="text-gray-700 leading-relaxed break-words overflow-wrap-anywhere">
              {description.trim()}
            </p>
          </div>
        );
        currentIndex++;
      }
    }

    // Add any remaining text
    const lastSection = sections[sections.length - 1];
    if (lastSection && lastSection.trim() && !lastSection.includes('*')) {
      elements.push(
        <p key="final-desc" className="text-gray-700">
          {lastSection.trim()}
        </p>
      );
    }

    return <div>{elements}</div>;
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
          <h1 className="text-3xl font-bold text-gray-900">Investment Products</h1>
          <p className="text-gray-600 mt-2">
            Discover investment opportunities tailored to your goals
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAddProductModal(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Product
          </button>
        )}
      </div>

      {/* AI Recommendations */}
      {recommendations && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-8 border border-purple-200 w-full max-w-full overflow-hidden">
          <div className="flex items-center mb-4">
            <Brain className="h-6 w-6 text-purple-600 mr-2 flex-shrink-0" />
            <h2 className="text-xl font-bold text-gray-900 break-words">AI Recommendations for You</h2>
          </div>
          <div className="text-gray-700 leading-relaxed w-full max-w-full overflow-hidden">
            {formatRecommendations(recommendations)}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="Equity">Equity</option>
              <option value="Fixed Income">Fixed Income</option>
              <option value="Mixed">Mixed</option>
              <option value="Real Estate">Real Estate</option>
            </select>
          </div>

          {/* Risk Filter */}
          <div>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Risk Levels</option>
              <option value="low">Low Risk</option>
              <option value="moderate">Medium Risk</option>
              <option value="high">High Risk</option>
            </select>
          </div>

          {/* AI Recommend Button */}
          <button
            onClick={handleRecommendClick}
            className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            <Brain className="h-4 w-4 mr-2" />
            AI Recommend
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const typeName = product.productType || product.type || 'Product';
          const TypeIcon = getTypeIcon(typeName);
          return (
            <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <TypeIcon className="h-6 w-6 text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                  </div>
                  {product.rating != null && (
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm text-gray-600">{product.rating}</span>
                    </div>
                  )}
                </div>

                <p className="text-gray-600 mb-4 text-sm">{product.description}</p>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Annual Yield</span>
                    <span className="text-lg font-bold text-green-600">{product.annualYield || product.expectedYield || 0}%</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Min Investment</span>
                    <span className="font-semibold text-gray-900">${(product.minimumInvestment || product.minInvestment || 0).toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Risk Level</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(product.riskLevel)}`}>
                      {product.riskLevel}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Type</span>
                    <span className="text-sm font-medium text-gray-900">{getTypeDisplayName(typeName)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Tenure</span>
                    <span className="text-sm font-medium text-gray-900">{product.tenureMonths} months</span>
                  </div>

                  {product.maxInvestment && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Max Investment</span>
                      <span className="text-sm font-medium text-gray-900">${product.maxInvestment.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex space-x-2">
                <Link
                  to={`/products/${product.id}`}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  View Details
                </Link>
                {isAdmin && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteProduct(product.id);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete Product"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
        </div>
      )}

      {/* Risk Selection Modal */}
      {showRiskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Select Risk Level</h3>
              <button
                onClick={() => setShowRiskModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-gray-600 mb-6">
              Choose your risk appetite to get personalized AI recommendations:
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => loadRecommendations('low')}
                disabled={loadingRecommendations}
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <div>
                    <div className="font-medium text-gray-900">Low Risk</div>
                    <div className="text-sm text-gray-600">Conservative, stable returns</div>
                  </div>
                </div>
                {loadingRecommendations && selectedRiskForRecommendation === 'low' && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                )}
              </button>
              
              <button
                onClick={() => loadRecommendations('moderate')}
                disabled={loadingRecommendations}
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-yellow-50 hover:border-yellow-300 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                  <div>
                    <div className="font-medium text-gray-900">Moderate Risk</div>
                    <div className="text-sm text-gray-600">Balanced growth potential</div>
                  </div>
                </div>
                {loadingRecommendations && selectedRiskForRecommendation === 'moderate' && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                )}
              </button>
              
              <button
                onClick={() => loadRecommendations('high')}
                disabled={loadingRecommendations}
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                  <div>
                    <div className="font-medium text-gray-900">High Risk</div>
                    <div className="text-sm text-gray-600">Aggressive, high potential returns</div>
                  </div>
                </div>
                {loadingRecommendations && selectedRiskForRecommendation === 'high' && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Add New Product</h3>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <span className="text-xs text-gray-500">Leave empty for AI generation</span>
                </div>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  placeholder="Optional - Leave empty to generate with AI"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Investment Type</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={newProduct.investmentType}
                    onChange={(e) => setNewProduct({...newProduct, investmentType: e.target.value as InvestmentType})}
                    required
                  >
                    <option value="fd">fd</option>
                    <option value="bond">bond</option>
                    <option value="mf">mf</option>
                    <option value="etf">etf</option>
                    <option value="other">other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={newProduct.riskLevel}
                    onChange={(e) => setNewProduct({...newProduct, riskLevel: e.target.value as RiskLevel})}
                    required
                  >
                    <option value="low">low</option>
                    <option value="moderate">moderate</option>
                    <option value="high">high</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Investment ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={newProduct.minInvestment ?? ''}
                    onChange={handleNumberChange}
                    name="minInvestment"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Investment ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={newProduct.maxInvestment ?? ''}
                    onChange={handleNumberChange}
                    name="maxInvestment"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Annual Yield (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={newProduct.annualYield ?? ''}
                    onChange={handleNumberChange}
                    name="annualYield"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tenure (Months)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={newProduct.tenureMonths ?? ''}
                    onChange={(e) => setNewProduct({...newProduct, tenureMonths: e.target.value === '' ? undefined : parseInt(e.target.value)})}
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddProduct}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!newProduct.name || isSubmitting}
                >
                  {isSubmitting ? 'Adding...' : 'Add Product'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;