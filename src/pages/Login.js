import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import api from '../services/api';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captcha, setCaptcha] = useState(null);
  const [requiresCaptcha, setRequiresCaptcha] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchCaptcha = async () => {
    try {
      const response = await api.get('/auth/captcha');
      setCaptcha(response.data);
      setCaptchaAnswer('');
    } catch (err) {
      console.error('Failed to fetch captcha:', err);
    }
  };

  useEffect(() => {
    if (requiresCaptcha) {
      fetchCaptcha();
    }
  }, [requiresCaptcha]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loginData = {
        username,
        password,
      };

      if (requiresCaptcha && captcha) {
        loginData.captchaId = captcha.captchaId;
        loginData.captchaAnswer = parseInt(captchaAnswer);
      }

      await authService.login(loginData.username, loginData.password, loginData.captchaId, loginData.captchaAnswer);
      navigate('/');
    } catch (err) {
      const errorData = err.response?.data;
      setError(errorData?.error || 'Login failed. Please try again.');
      
      if (errorData?.requiresCaptcha) {
        setRequiresCaptcha(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Rock Gym</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 font-medium mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              autoFocus
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {requiresCaptcha && captcha && (
            <div className="mb-6">
              <label htmlFor="captcha" className="block text-gray-700 font-medium mb-2">
                Security Check: {captcha.question}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  id="captcha"
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="Enter answer"
                />
                <button
                  type="button"
                  onClick={fetchCaptcha}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Refresh
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
