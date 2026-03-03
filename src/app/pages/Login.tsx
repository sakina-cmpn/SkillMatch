// src/pages/Login.tsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);

      setEmail('');
      setPassword('');
      navigate("/");

    } catch (err: any) {
      setError("Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: 'linear-gradient(to bottom right, #F8FAFC, #FFFFFF)',
      }}
    >
      <div
        className="w-full max-w-md p-8 sm:p-10 rounded-2xl backdrop-blur-xl shadow-xl border border-white/40"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.75)' }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#052659' }}>
            Welcome to SkillMatch
          </h1>
          <p className="text-sm text-gray-500">
            Sign in to continue your journey
          </p>
        </div>

        {error && (
          <div className="text-red-600 text-center bg-red-50 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>

          {/* Email */}
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email Address"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#5483B3] focus:ring-2 focus:ring-[#C1E8FF] outline-none"
          />

          {/* Password */}
          <div className="relative">
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-[#5483B3] focus:ring-2 focus:ring-[#C1E8FF] outline-none"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3 text-sm text-[#5483B3]"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-medium text-white bg-[#5483B3] hover:bg-[#3e6f9e] transition-all"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

        </form>

        <div className="text-center text-sm mt-6">
          <span>Don't have an account? </span>
          <Link to="/register" className="text-[#5483B3] font-medium">
            Register now
          </Link>
        </div>

      </div>
    </div>
  );
}
