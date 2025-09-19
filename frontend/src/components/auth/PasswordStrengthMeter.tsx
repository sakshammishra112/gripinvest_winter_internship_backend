import React from 'react';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface PasswordStrengthMeterProps {
  passwordStrength: {
    score: number;
    strength: string;
    suggestions: string[];
  };
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ passwordStrength }) => {
  const getStrengthColor = (strength: string) => {
    switch (strength.toLowerCase()) {
      case 'weak':
        return 'text-red-600 bg-red-100';
      case 'fair':
        return 'text-orange-600 bg-orange-100';
      case 'good':
        return 'text-yellow-600 bg-yellow-100';
      case 'strong':
        return 'text-green-600 bg-green-100';
      case 'very_strong':
        return 'text-emerald-600 bg-emerald-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStrengthIcon = (strength: string) => {
    switch (strength.toLowerCase()) {
      case 'weak':
      case 'fair':
        return <XCircle className="h-4 w-4" />;
      case 'good':
        return <AlertCircle className="h-4 w-4" />;
      case 'strong':
      case 'very_strong':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const strengthPercentage = (passwordStrength.score / 5) * 100;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              strengthPercentage <= 20
                ? 'bg-red-500'
                : strengthPercentage <= 40
                ? 'bg-orange-500'
                : strengthPercentage <= 60
                ? 'bg-yellow-500'
                : strengthPercentage <= 80
                ? 'bg-green-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${strengthPercentage}%` }}
          />
        </div>
        <div className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium ${getStrengthColor(passwordStrength.strength)}`}>
          {getStrengthIcon(passwordStrength.strength)}
          <span>{passwordStrength.strength.replace('_', ' ')}</span>
        </div>
      </div>

      {passwordStrength.suggestions.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <p className="text-xs font-medium text-blue-800 mb-1">AI Suggestions:</p>
          <ul className="text-xs text-blue-700 space-y-1">
            {passwordStrength.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start space-x-1">
                <span>•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};