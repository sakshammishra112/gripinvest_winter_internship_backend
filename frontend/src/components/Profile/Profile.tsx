import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Shield, Edit2, Save, X, Brain, TrendingUp } from 'lucide-react';
import { apiClient } from '../../utils/api';

export const Profile: React.FC = () => {
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    riskAppetite: 'moderate' as 'low' | 'moderate' | 'high',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState('');
  const [showRecommendations, setShowRecommendations] = useState(false);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const details = await apiClient.getUserDetails();
        setProfileData({
          firstName: details.firstName || '',
          lastName: details.lastName || '',
          email: details.email || '',
          phoneNumber: '',
          riskAppetite: (details.riskAppetite as 'low' | 'moderate' | 'high') || 'moderate',
        });
      } catch {
        // keep defaults if failed
      }
    };
    loadDetails();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      // In a real app, you would call an API to update the profile
      // await apiClient.updateProfile(profileData);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset to original data in a real app
  };

  const getAIRecommendations = async () => {
    setLoading(true);
    try {
      console.log('Starting AI recommendations fetch...');
      console.log('API Client:', apiClient);
      console.log('getInvestingTrends method exists:', typeof apiClient.getInvestingTrends);
      
      // Try investing trends first
      let response;
      try {
        response = await apiClient.getInvestingTrends();
        console.log('Investing trends API Response:', response);
        console.log('Response type:', typeof response);
        console.log('Response length:', response?.length);
        
        // Since the controller returns ResponseEntity<String>, the response should be a string
        if (typeof response === 'string' && response.trim().length > 0) {
          console.log('Successfully got trends text:', response.substring(0, 100) + '...');
          setRecommendations(response);
          setShowRecommendations(true);
          return; // Exit early on success
        } else {
          console.log('Empty or invalid response, trying fallback...');
          throw new Error('Empty response from trends API');
        }
      } catch (trendsError) {
        console.log('Investing trends failed, trying product recommendations as fallback...');
        console.error('Trends error:', trendsError);
        
        // Fallback to product recommendations
        response = await apiClient.getProductRecommendations(profileData.riskAppetite);
        console.log('Product recommendations fallback response:', response);
      }
      
      console.log('Final API Response:', response);
      console.log('Response type:', typeof response);
      
      // Handle different response types for fallback
      let recommendationText = '';
      if (typeof response === 'string') {
        recommendationText = response;
        console.log('Using string response:', recommendationText);
      } else if (response && typeof response === 'object') {
        recommendationText = response.message || response.text || response.trends || response.recommendation || JSON.stringify(response);
        console.log('Using object response:', recommendationText);
      } else {
        recommendationText = String(response);
        console.log('Using converted response:', recommendationText);
      }
      
      console.log('Final recommendation text:', recommendationText);
      setRecommendations(recommendationText);
      setShowRecommendations(true);
      console.log('Recommendations set successfully');
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      
      // Show sample data if both APIs fail
      const sampleTrends = `Global investing currently sees a shift towards emerging markets, particularly in Asia and Southeast Asia, driven by growth potential and diversification opportunities. Emerging sectors include renewable energy, electric vehicles (EVs), artificial intelligence (AI), and cybersecurity, all fueled by technological advancements and sustainability concerns. Popular investment strategies involve ESG (Environmental, Social, and Governance) investing, aiming for both financial returns and positive societal impact.`;
      
      setRecommendations(sampleTrends);
      setShowRecommendations(true);
      alert(`API unavailable. Showing sample trends. Error: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
      console.log('Loading finished');
    }
  };

  const getRiskDescription = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'Conservative investor who prefers stable, low-risk investments with guaranteed returns.';
      case 'moderate':
        return 'Moderate investor who seeks balanced growth with acceptable level of risk.';
      case 'high':
        return 'Aggressive investor who is willing to take high risks for potentially higher returns.';
      default:
        return '';
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="mt-1 text-gray-600">Manage your account settings and investment preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      <Save className="h-4 w-4" />
                      <span>{loading ? 'Saving...' : 'Save'}</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                        disabled={!isEditing}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="tel"
                      value={profileData.phoneNumber}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Risk Appetite
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <select
                      value={profileData.riskAppetite}
                      onChange={(e) => setProfileData(prev => ({ ...prev, riskAppetite: e.target.value as 'low' | 'moderate' | 'high' }))}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 appearance-none"
                    >
                      <option value="low">Conservative (Low Risk)</option>
                      <option value="moderate">Moderate (Medium Risk)</option>
                      <option value="high">Aggressive (High Risk)</option>
                    </select>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">
                    {getRiskDescription(profileData.riskAppetite)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Risk Profile Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Investment Profile</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Risk Level</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(profileData.riskAppetite)}`}>
                    {profileData.riskAppetite}
                  </span>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={getAIRecommendations}
                    disabled={loading}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    <Brain className="h-5 w-5" />
                    <span>{loading ? 'Getting Recommendations...' : 'Get AI Recommendations'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="text-sm font-medium text-gray-900">Jan 2024</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Investments</span>
                  <span className="text-sm font-medium text-gray-900">5</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Success Rate</span>
                  <span className="text-sm font-medium text-green-600">95%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        {showRecommendations && recommendations && (
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
                  <p className="text-sm text-gray-600">Personalized investment suggestions based on your profile</p>
                </div>
              </div>
              <button
                onClick={() => setShowRecommendations(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-gray-800 leading-relaxed">{recommendations}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};