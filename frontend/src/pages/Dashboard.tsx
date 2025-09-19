import React, { useState, useEffect } from 'react';
import { apiClient } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { TrendingUp, TrendingDown, DollarSign, Briefcase, Brain, AlertCircle, Search, X, Building2 } from 'lucide-react';

interface Investment {
  id: string;
  productName: string;
  amount: number;
  currentValue: number;
  returns: number;
  type: string;
}

interface StockSymbol {
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string;
}

interface SymbolSearchResponse {
  count: number;
  result: StockSymbol[];
}

interface CompanyProfile {
  country: string;
  currency: string;
  exchange: string;
  finnhubIndustry: string;
  ipo: string;
  logo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
}

interface PortfolioInsights {
  totalValue: number;
  totalReturns: number;
  riskDistribution: { low: number; medium: number; high: number };
  diversificationScore: number;
  recommendations: string[];
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [insights, setInsights] = useState<PortfolioInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StockSymbol[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileSymbol, setProfileSymbol] = useState('');
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsGenerated, setInsightsGenerated] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const fetchCompanyProfile = async (symbol: string) => {
    if (!symbol) return;
    
    setIsProfileLoading(true);
    setProfileError('');
    
    try {
      const response = await fetch(`http://localhost:8080/api/finnhub/company/profile?symbol=${encodeURIComponent(symbol)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setCompanyProfile(data);
      setProfileError('');
    } catch (err) {
      console.error('Error fetching company profile:', err);
      setProfileError('Failed to load company profile. Please check the symbol and try again.');
      setCompanyProfile(null);
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleProfileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (profileSymbol.trim()) {
      fetchCompanyProfile(profileSymbol.trim());
    }
  };

  const generateInsights = async () => {
    try {
      setInsightsLoading(true);
      const [insightsData] = await Promise.all([
        apiClient.getPortfolioInsights(),
      ]);
      
      setInsights(prev => ({
        ...prev!,
        recommendations: insightsData?.aiInsights ? [insightsData.aiInsights] : [],
        totalValue: prev?.totalValue || 0,
        totalReturns: prev?.totalReturns || 0,
        riskDistribution: prev?.riskDistribution || { low: 0, medium: 0, high: 0 },
        diversificationScore: prev?.diversificationScore || 0
      }));
      setInsightsGenerated(true);
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setInsightsLoading(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      const [investmentsData, balance, totalReturnsResp] = await Promise.all([
        apiClient.getUserPortfolio(),
        apiClient.getUserBalance(),
        apiClient.getTotalReturns(),
      ]);
      setInvestments(investmentsData as any);
      
      // Set basic insights without recommendations initially
      setInsights({
        totalValue: balance as number,
        totalReturns: (totalReturnsResp as any)?.totalReturns ?? 0,
        riskDistribution: { low: 0, medium: 0, high: 0 },
        diversificationScore: 0,
        recommendations: []
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setInvestments([]);
      setInsights({
        totalValue: 0,
        totalReturns: 0,
        riskDistribution: { low: 0, medium: 0, high: 0 },
        diversificationScore: 0,
        recommendations: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const query = searchQuery.trim();
    if (!query) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchError('');
    
    try {
      // Log the full URL being called for debugging
      const apiUrl = `http://localhost:8080/api/finnhub/lookup?q=${encodeURIComponent(query)}&exchange=US`;
      console.log('Making request to:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Include cookies if needed
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      const data: SymbolSearchResponse = await response.json();
      console.log('API Response:', data);
      
      if (!data || !Array.isArray(data.result)) {
        throw new Error('Invalid response format from server');
      }
      
      setSearchResults(data.result);
    } catch (err) {
      console.error('Error searching symbols:', err);
      setSearchError(err instanceof Error ? err.message : 'Failed to search symbols. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const portfolioStats = [
    {
      name: 'Total Portfolio Value',
      value: `$${insights?.totalValue?.toLocaleString() || '0'}`,
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: 'Total Returns',
      value: `$${insights?.totalReturns?.toLocaleString() || '0'}`,
      icon: insights && insights.totalReturns >= 0 ? TrendingUp : TrendingDown,
      color: insights && insights.totalReturns >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: insights && insights.totalReturns >= 0 ? 'bg-green-100' : 'bg-red-100'
    },
    {
      name: 'Active Investments',
      value: investments.length.toString(),
      icon: Briefcase,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName || 'Investor'}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's an overview of your investment portfolio
          </p>
        </div>
        <button
          onClick={() => setIsProfileModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Building2 className="h-4 w-4 mr-2" />
          Search Company
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {portfolioStats.map((stat) => {
          const Icon = stat.icon;
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AI Insights Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <Brain className="h-6 w-6 text-purple-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">AI Portfolio Insights</h2>
            </div>
            {!insightsGenerated && (
              <button
                onClick={generateInsights}
                disabled={insightsLoading}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {insightsLoading ? 'Generating...' : 'Generate Insights'}
              </button>
            )}
          </div>
          {insights && insightsGenerated ? (
            <div className="space-y-4">
              {insights.recommendations?.length > 0 ? (
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Highlights</h3>
                  <div className="space-y-2">
                    {insights.recommendations.map((r, i) => (
                      <div key={i} className="flex items-start p-3 bg-blue-50 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm text-blue-800">{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No insights available. Try generating insights.
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-gray-500 mb-4">
                Get personalized investment insights based on your portfolio
              </p>
              <button
                onClick={generateInsights}
                disabled={insightsLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {insightsLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Generate Insights
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Stock Symbol Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Stock Symbol Lookup</h2>
          
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search for stocks (e.g., AAPL, TSLA)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                      setSearchError('');
                    }}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={isSearching || !searchQuery.trim()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>

          {searchError && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <X className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{searchError}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {searchResults.length > 0 ? (
              <div className="overflow-hidden border border-gray-200 rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Symbol
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {searchResults.map((stock, index) => (
                      <tr key={`${stock.symbol}-${index}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          {stock.displaySymbol}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {stock.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {stock.type}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : searchQuery && !isSearching && !searchError ? (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No results found for "{searchQuery}"</p>
                <p className="text-sm text-gray-500 mt-1">Try a different search term</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Company Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Search Company Profile
                  </h3>
                  
                  <form onSubmit={handleProfileSearch} className="space-y-4">
                    <div>
                      <label htmlFor="symbol" className="block text-sm font-medium text-gray-700">
                        Stock Symbol
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <input
                          type="text"
                          name="symbol"
                          id="symbol"
                          className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-4 pr-12 sm:text-sm border-gray-300 rounded-md p-2 border"
                          placeholder="e.g., AAPL, MSFT"
                          value={profileSymbol}
                          onChange={(e) => setProfileSymbol(e.target.value.toUpperCase())}
                        />
                      </div>
                    </div>
                    
                    {profileError && (
                      <div className="bg-red-50 border-l-4 border-red-400 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <X className="h-5 w-5 text-red-400" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-red-700">{profileError}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {companyProfile && (
                      <div className="mt-4 border-t border-gray-200 pt-4">
                        <div className="flex items-center space-x-4 mb-4">
                          {companyProfile.logo && (
                            <img 
                              src={companyProfile.logo} 
                              alt={`${companyProfile.name} logo`} 
                              className="h-16 w-16 object-contain"
                            />
                          )}
                          <div>
                            <h4 className="text-lg font-bold">{companyProfile.name}</h4>
                            <p className="text-sm text-gray-500">{companyProfile.ticker}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Industry</p>
                            <p>{companyProfile.finnhubIndustry}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Exchange</p>
                            <p>{companyProfile.exchange}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Currency</p>
                            <p>{companyProfile.currency}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">IPO Date</p>
                            <p>{companyProfile.ipo}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Market Cap</p>
                            <p>${(companyProfile.marketCapitalization / 1000).toFixed(2)}B</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Shares Outstanding</p>
                            <p>{companyProfile.shareOutstanding.toLocaleString()}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-gray-500">Website</p>
                            <a 
                              href={companyProfile.weburl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {companyProfile.weburl}
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </form>
                </div>
              </div>
              
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleProfileSearch}
                  disabled={isProfileLoading || !profileSymbol.trim()}
                >
                  {isProfileLoading ? 'Searching...' : 'Search'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setIsProfileModalOpen(false);
                    setProfileSymbol('');
                    setCompanyProfile(null);
                    setProfileError('');
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;