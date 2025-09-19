import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../utils/api';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotPasswordStep, setForgotPasswordStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordError('');
    setLoading(true);
    
    try {
      if (forgotPasswordStep === 'email') {
        await apiClient.forgotPassword(forgotPasswordEmail);
        setForgotPasswordStep('otp');
        setForgotPasswordSuccess('OTP sent to your email');
      } else if (forgotPasswordStep === 'otp') {
        await apiClient.verifyOTP(forgotPasswordEmail, otp);
        setForgotPasswordStep('reset');
        setForgotPasswordSuccess('OTP verified. Please set your new password.');
      } else if (forgotPasswordStep === 'reset') {
        if (newPassword !== confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await apiClient.resetPassword(forgotPasswordEmail, otp, newPassword);
        setForgotPasswordSuccess('Password reset successfully. You can now log in with your new password.');
        
        // Close the modal after a delay
        setTimeout(() => {
          setShowForgotPassword(false);
          setForgotPasswordStep('email');
          setForgotPasswordEmail('');
          setOtp('');
          setNewPassword('');
          setConfirmPassword('');
          setForgotPasswordSuccess('');
        }, 2000);
      }
    } catch (err: any) {
      setForgotPasswordError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center">
            <div className="flex justify-center">
              <TrendingUp className="h-12 w-12 text-blue-600" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Welcome back</h2>
            <p className="mt-2 text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 hover:underline">
                Sign up here
              </Link>
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Forgot your password?{' '}
              <button 
                onClick={() => setShowForgotPassword(true)}
                className="font-medium text-blue-600 hover:text-blue-500 hover:underline"
              >
                Reset it here
              </button>
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1 relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none relative block w-full pl-12 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none relative block w-full pl-12 pr-12 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Forgot your password?
              </Link>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {forgotPasswordStep === 'email' && 'Reset Password'}
                {forgotPasswordStep === 'otp' && 'Verify OTP'}
                {forgotPasswordStep === 'reset' && 'Set New Password'}
              </h3>
              <button 
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotPasswordStep('email');
                  setForgotPasswordError('');
                  setForgotPasswordSuccess('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            {forgotPasswordError && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 text-sm rounded">
                {forgotPasswordError}
              </div>
            )}
            
            {forgotPasswordSuccess && (
              <div className="mb-4 p-2 bg-green-100 text-green-700 text-sm rounded">
                {forgotPasswordSuccess}
              </div>
            )}
            
            <form onSubmit={handleForgotPassword} className="space-y-4">
              {forgotPasswordStep === 'email' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    className="w-full border px-3 py-2 rounded-md"
                    required
                  />
                </div>
              )}
              
              {forgotPasswordStep === 'otp' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enter OTP sent to {forgotPasswordEmail}
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full border px-3 py-2 rounded-md"
                    placeholder="Enter 6-digit OTP"
                    required
                  />
                </div>
              )}
              
              {forgotPasswordStep === 'reset' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full border px-3 py-2 rounded-md"
                      required
                      minLength={6}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full border px-3 py-2 rounded-md"
                      required
                      minLength={6}
                    />
                  </div>
                </>
              )}
              
              <div className="flex justify-end space-x-3">
                {forgotPasswordStep !== 'email' && (
                  <button
                    type="button"
                    onClick={() => setForgotPasswordStep(prev => prev === 'reset' ? 'otp' : 'email')}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                    disabled={loading}
                  >
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  {loading ? 'Processing...' : 
                    forgotPasswordStep === 'email' ? 'Send OTP' :
                    forgotPasswordStep === 'otp' ? 'Verify OTP' :
                    'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};