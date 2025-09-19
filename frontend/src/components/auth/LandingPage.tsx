import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Shield, Target, Zap, ArrowRight, BarChart3, PieChart, DollarSign } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const features = [
    {
      icon: Shield,
      title: 'Secure Investments',
      description: 'Bank-grade security with advanced encryption to protect your investments.',
    },
    {
      icon: Target,
      title: 'Smart Recommendations',
      description: 'AI-powered investment suggestions based on your risk profile and goals.',
    },
    {
      icon: Zap,
      title: 'Real-time Insights',
      description: 'Live portfolio tracking with detailed analytics and performance metrics.',
    },
    {
      icon: BarChart3,
      title: 'Diverse Portfolio',
      description: 'Access to a wide range of investment products across different risk levels.',
    },
  ];

  const stats = [
    { value: '₹10M+', label: 'Investments Managed' },
    { value: '5000+', label: 'Happy Investors' },
    { value: '15%', label: 'Average Returns' },
    { value: '99.9%', label: 'Uptime' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex justify-center items-center mb-8">
              <TrendingUp className="h-16 w-16 text-blue-600" />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Smart Investing Made
              <span className="text-blue-600 block">Simple & Secure</span>
            </h1>
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Join thousands of investors who trust MiniInvest for their financial growth. 
              Get AI-powered recommendations, real-time insights, and diversified investment options.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Start Investing Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-gray-50 border-2 border-blue-600 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Floating cards */}
        <div className="absolute top-10 left-10 hidden lg:block">
          <div className="bg-white p-4 rounded-lg shadow-lg transform rotate-3 hover:rotate-6 transition-transform">
            <DollarSign className="h-8 w-8 text-green-600" />
            <p className="text-sm font-medium text-gray-800 mt-2">High Returns</p>
          </div>
        </div>
        <div className="absolute top-20 right-10 hidden lg:block">
          <div className="bg-white p-4 rounded-lg shadow-lg transform -rotate-3 hover:-rotate-6 transition-transform">
            <PieChart className="h-8 w-8 text-blue-600" />
            <p className="text-sm font-medium text-gray-800 mt-2">Diversified</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose MiniInvest?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of investing with our cutting-edge platform designed for modern investors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow group hover:-translate-y-2 transform transition-transform"
              >
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-lg mb-6 group-hover:bg-blue-200 transition-colors">
                  <feature.icon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Start Your Investment Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Join MiniInvest today and take the first step towards financial freedom with smart, secure investments.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Get Started Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};