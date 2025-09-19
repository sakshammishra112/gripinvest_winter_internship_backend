import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Shield, DollarSign, Brain, Edit, Loader2 } from 'lucide-react';
import { apiClient } from '../utils/api';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingTrends, setFetchingTrends] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    riskAppetite: (user?.riskAppetite?.toLowerCase() as 'low' | 'medium' | 'high' | undefined) || 'medium'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert risk appetite to uppercase to match the expected type
      await updateUser({
        ...formData,
        riskAppetite: formData.riskAppetite.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH'
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvestingTrends = async () => {
    setFetchingTrends(true);
    setAiRecommendations(['Fetching the latest market trends...']);
    try {
      const trends = await apiClient.getInvestingTrends();
      // Format the response as an array of strings
      const formattedTrends = typeof trends === 'string' 
        ? trends.split('\n').filter(line => line.trim() !== '')
        : [JSON.stringify(trends)];
      
      setAiRecommendations(formattedTrends);
    } catch (err) {
      console.error('Error fetching trends:', err);
      setAiRecommendations(['Unable to fetch trends at this time. Please try again later.']);
    } finally {
      setFetchingTrends(false);
    }
  };

  const getRiskDescription = (risk: string) => {
    const riskLevel = risk.toLowerCase();
    switch (riskLevel) {
      case 'low':
        return 'Conservative investor seeking capital preservation with minimal risk';
      case 'medium':
        return 'Balanced investor seeking moderate growth with acceptable risk';
      case 'high':
        return 'Aggressive investor seeking maximum growth with high risk tolerance';
      default:
        return '';
    }
  };

  const getRiskColor = (risk: string) => {
    const riskLevel = risk.toLowerCase();
    switch (riskLevel) {
      case 'low':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile not found</h2>
          <p className="text-gray-600">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account information and investment preferences</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          <Edit className="h-4 w-4 mr-2" />
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* User Info */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-full">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h2>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="riskAppetite" className="block text-sm font-medium text-gray-700 mb-2">
                    Risk Appetite
                  </label>
                  <select
                    id="riskAppetite"
                    name="riskAppetite"
                    value={formData.riskAppetite}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="low">Conservative (Low Risk)</option>
                    <option value="medium">Balanced (Medium Risk)</option>
                    <option value="high">Aggressive (High Risk)</option>
                  </select>
                  <p className="text-sm text-gray-600 mt-1">
                    {getRiskDescription(formData.riskAppetite)}
                  </p>
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                  >
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Full Name</p>
                      <p className="font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-semibold text-gray-900">{user?.email || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Risk Appetite</p>
                    <div className="flex items-center mt-1">
                      <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getRiskColor(user?.riskAppetite || 'medium')}`}>
                        {user?.riskAppetite?.toLowerCase() || 'medium'} risk
                      </span>
                      <span className="ml-3 text-sm text-gray-600">
                        {getRiskDescription(user?.riskAppetite || 'medium')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Account Balance</p>
                    <p className="text-2xl font-bold text-green-600">${user.balance?.toLocaleString() || '0'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Recommendations - Wider Section */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-full">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Brain className="h-6 w-6 text-purple-600 mr-3" />
                  <h2 className="text-xl font-bold text-gray-900">Market Trends & Analysis</h2>
                </div>
                <button
                  onClick={fetchInvestingTrends}
                  disabled={fetchingTrends}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm whitespace-nowrap"
                >
                  {fetchingTrends ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-2" />
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Refresh Market Trends
                    </>
                  )}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto max-h-[600px] pr-2">
                <div className="space-y-4">
                  {aiRecommendations.length > 0 ? (
                    aiRecommendations.map((recommendation, index) => (
                      <div key={index} className="bg-gradient-to-r from-purple-50 to-blue-50 p-5 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 h-6 w-6 text-purple-500 mr-3 mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <p className="text-gray-800 leading-relaxed">{recommendation}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full py-12 bg-gray-50 rounded-lg">
                      <Brain className="h-12 w-12 text-gray-300 mb-4" />
                      <p className="text-gray-500 text-center max-w-md px-4">
                        Click 'Refresh Market Trends' to get the latest investment insights and market analysis
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <a
                  href="/products"
                  className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  Explore Products
                </a>
                <a
                  href="/investments"
                  className="block w-full text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
                >
                  View Portfolio
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
