import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthForm from '../components/auth/AuthForm';
import { BarChart3, Shield, TrendingUp, Users } from 'lucide-react';

const LandingPage: React.FC = () => {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [signupSuccess, setSignupSuccess] = useState(false);

  const features = [
    {
      icon: BarChart3,
      title: 'Smart Analytics',
      description: 'AI-powered portfolio insights and performance tracking'
    },
    {
      icon: Shield,
      title: 'Secure Investment',
      description: 'Bank-level security with comprehensive risk management'
    },
    {
      icon: TrendingUp,
      title: 'Optimized Returns',
      description: 'Intelligent recommendations based on your risk profile'
    },
    {
      icon: Users,
      title: 'Expert Support',
      description: '24/7 support from investment professionals'
    }
  ];

  const handleAuthClick = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setShowAuth(true);
  };

  const handleSignupSuccess = () => {
    setSignupSuccess(true);
    setShowAuth(false);
    // Reset success message after 5 seconds
    setTimeout(() => setSignupSuccess(false), 5000);
  };

  if (showAuth) {
    return (
      <AuthForm 
        mode={authMode} 
        onBack={() => setShowAuth(false)}
        onSuccess={authMode === 'signup' ? handleSignupSuccess : undefined}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <div className="mb-8">
                  <div className="inline-flex items-center">
                    <BarChart3 className="h-10 w-10 text-blue-600" />
                    <span className="ml-3 text-2xl font-bold text-gray-900">Horizon</span>
                  </div>
                </div>
                <h1 className="text-4xl tracking-tight font-bold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Invest Smarter</span>
                  <span className="block text-blue-600 xl:inline"> with AI-Powered Insights</span>
                </h1>
                {signupSuccess && (
                  <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md">
                    Account created successfully! Please sign in to continue.
                  </div>
                )}
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Horizon helps you build a better investment portfolio with AI-powered insights, personalized recommendations, 
                  and comprehensive portfolio management tools designed for modern investors.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={() => handleAuthClick('signup')}
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-colors duration-200"
                  >
                    Get Started
                  </button>
                  <button
                    onClick={() => handleAuthClick('login')}
                    className="w-full flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-colors duration-200"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="h-56 w-full bg-gradient-to-br from-blue-100 to-blue-200 sm:h-72 md:h-96 lg:w-full lg:h-full flex items-center justify-center">
            <BarChart3 className="h-48 w-48 text-blue-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to invest successfully
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our platform combines cutting-edge AI technology with proven investment strategies 
              to help you make informed decisions and grow your wealth.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="relative">
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                      <Icon className="h-6 w-6" />
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                      {feature.title}
                    </p>
                    <p className="mt-2 ml-16 text-base text-gray-500">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-50">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            <span className="block">Ready to start investing?</span>
            <span className="block text-blue-600">Join thousands of smart investors.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-gray-600">
            Start building your investment portfolio today with personalized AI recommendations 
            and expert-level portfolio management tools.
          </p>
          <button
            onClick={() => handleAuthClick('signup')}
            className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 sm:w-auto transition-colors duration-200"
          >
            Create Free Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;