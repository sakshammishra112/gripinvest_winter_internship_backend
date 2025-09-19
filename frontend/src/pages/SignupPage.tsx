import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../utils/api';

const SignupPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotPasswordStep, setForgotPasswordStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const success = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        passwordHash: formData.password,
        riskAppetite: 'moderate',
      });
      
      if (success) {
        // Show success message and redirect to login after a short delay
        setError('Registration successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 shadow-md rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
            required
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
        <div className="text-center mt-4">
          <p className="text-sm">
            Already have an account?{' '}
            <span
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:underline cursor-pointer"
            >
              Log In
            </span>
          </p>
          <p className="text-sm mt-2">
            Forgot your password?{' '}
            <span 
              onClick={() => setShowForgotPassword(true)}
              className="text-blue-600 hover:underline cursor-pointer"
            >
              Reset Password
            </span>
          </p>
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

        <p className="text-sm text-center mt-4">
          Don't have an account?{' '}
          <span
            onClick={() => navigate('/')}
            className="text-blue-600 cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
