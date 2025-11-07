import React, { useState } from 'react';
import { Button } from './ui/Button';
import { theme } from '../config/theme';

interface AdminLoginProps {
  onLogin: (password: string) => void;
  error?: string;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, error }) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsLoading(true);
    onLogin(password);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl flex items-center justify-center">
              <div className="text-3xl">🔐</div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Admin Access</h1>
            <p className="text-gray-400">Enter password to access dashboard</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Admin Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-900 bg-opacity-20 border border-red-500 rounded-lg p-3">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              loading={isLoading}
              className="w-full"
              size="lg"
            >
              Access Dashboard
            </Button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-blue-900 bg-opacity-20 border border-blue-500 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="text-blue-400 text-lg">ℹ️</div>
              <div className="text-sm text-blue-200">
                <p className="font-medium mb-1">Security Notice:</p>
                <p>This dashboard contains sensitive order information. Keep your password secure and don't share access.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
