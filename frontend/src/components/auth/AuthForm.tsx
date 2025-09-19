import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../utils/api';
import { ArrowLeft, Eye, EyeOff, CheckCircle, XCircle, X } from 'lucide-react';

interface AuthFormProps {
  mode: 'login' | 'signup';
  onBack: () => void;
  onSuccess?: () => void;
}

interface PasswordStrength {
  score: number;
  feedback: string;
  suggestions: string[];
}

const AuthForm: React.FC<AuthFormProps> = ({ mode, onBack, onSuccess }) => {
  const { login, register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength | null>(null);
  
  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotPasswordStep, setForgotPasswordStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    riskAppetite: 'moderate' as 'low' | 'moderate' | 'high',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'password' && mode === 'signup' && value.length > 0) {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = async (password: string) => {
    try {
      const strength = await apiClient.checkPasswordStrength(password);
      setPasswordStrength({
        score: strength.score,
        feedback: strength.strength,
        suggestions: strength.suggestions || [],
      });
    } catch (error) {
      const score = getLocalPasswordScore(password);
      setPasswordStrength({
        score,
        feedback: getPasswordFeedback(score),
        suggestions: getPasswordSuggestions(password),
      });
    }
  };

  const getLocalPasswordScore = (password: string): number => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    return score;
  };

  const getPasswordFeedback = (score: number): string => {
    if (score <= 2) return 'Weak';
    if (score <= 3) return 'Fair';
    if (score <= 4) return 'Good';
    return 'Strong';
  };

  const getPasswordSuggestions = (password: string): string[] => {
    const suggestions = [] as string[];
    if (password.length < 8) suggestions.push('Use at least 8 characters');
    if (!/[a-z]/.test(password)) suggestions.push('Add lowercase letters');
    if (!/[A-Z]/.test(password)) suggestions.push('Add uppercase letters');
    if (!/\d/.test(password)) suggestions.push('Add numbers');
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password) === false) suggestions.push('Add special characters');
    return suggestions;
  };

  const getPasswordStrengthColor = (score: number): string => {
    if (score <= 2) return 'text-red-600';
    if (score <= 3) return 'text-yellow-600';
    if (score <= 4) return 'text-blue-600';
    return 'text-green-600';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        await register({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          passwordHash: formData.password,
          riskAppetite: formData.riskAppetite,
        });
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
      } else {
        await login(formData.email, formData.password);
      }
    } catch (error) {
      setError((error as Error).message);
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
        if (newPassword !== confirmNewPassword) {
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
          setConfirmNewPassword('');
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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <button
          onClick={onBack}
          className="mb-6 flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to home
        </button>
        
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {mode === 'login' 
              ? "Welcome back! Please sign in to continue." 
              : "Join thousands of smart investors today."
            }
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="Doe"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text_sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
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
              
              {mode === 'signup' && passwordStrength && formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Password strength:</span>
                    <span className={`text-sm font-medium ${getPasswordStrengthColor(passwordStrength.score)}`}>
                      {passwordStrength.feedback}
                    </span>
                  </div>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength.score <= 2 ? 'bg-red-500' :
                        passwordStrength.score <= 3 ? 'bg-yellow-500' :
                        passwordStrength.score <= 4 ? 'bg-blue-500' : 'bg-green-500'
                      }`}
                      style={{ 
                        width: `${(passwordStrength.score / 5) * 100}%`,
                        maxWidth: '100%',
                        minWidth: '0%'
                      }}
                    ></div>
                  </div>
                  {passwordStrength.suggestions.length > 0 && (
                    <ul className="mt-2 text-xs text-gray-600">
                      {passwordStrength.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-center">
                          <XCircle className="h-3 w-3 text-red-400 mr-1" />
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {mode === 'signup' && (
              <>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Confirm your password"
                  />
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <XCircle className="h-4 w-4 mr-1" />
                      Passwords do not match
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="riskAppetite" className="block text-sm font-medium text-gray-700">
                    Risk Appetite
                  </label>
                  <select
                    id="riskAppetite"
                    name="riskAppetite"
                    value={formData.riskAppetite}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="low">Conservative (Low Risk)</option>
                    <option value="moderate">Balanced (Medium Risk)</option>
                    <option value="high">Aggressive (High Risk)</option>
                  </select>
                </div>
              </>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {mode === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline focus:outline-none"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
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
                <X className="h-5 w-5" />
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
                    className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                        required
                        minLength={6}
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full border px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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

export default AuthForm;