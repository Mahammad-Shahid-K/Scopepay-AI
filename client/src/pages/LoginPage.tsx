import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        if (!fullName.trim() || !businessName.trim()) {
          setError('Please provide your name and business name.');
          setLoading(false);
          return;
        }
        await register(fullName, businessName, email);
      } else {
        await login(email);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await login('alex@riveracreative.io');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-md bg-[#DC2626] flex items-center justify-center text-white shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-[#111827]">
            ScopePay <span className="text-[#DC2626]">AI</span>
          </span>
        </Link>
        <h2 className="text-xl font-bold text-[#111827]">
          {isRegister ? 'Create Freelancer Account' : 'Sign in to your account'}
        </h2>
        <p className="mt-1 text-xs text-[#6B7280]">
          {isRegister
            ? 'Manage proposals, quotes, and sandbox payments with ease.'
            : 'Access your projects, scope agreements, and invoices.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card>
          <CardContent className="space-y-5">
            {error && (
              <div className="p-3 bg-[#FEF2F2] border border-red-200 text-[#DC2626] text-xs rounded-md">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <>
                  <Input
                    label="Full Name"
                    placeholder="Alex Rivera"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    required
                  />
                  <Input
                    label="Business or Studio Name"
                    placeholder="Rivera Creative Tech"
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                    required
                  />
                </>
              )}

              <Input
                label="Email Address"
                type="email"
                placeholder="alex@riveracreative.io"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />

              <div>
                <label className="block text-xs font-semibold text-[#111827] uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm text-[#111827] bg-white border border-[#E5E7EB] rounded-md shadow-sm placeholder:text-[#9CA3AF] focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-[#DC2626] pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#9CA3AF] hover:text-[#111827]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" loading={loading} className="w-full mt-2">
                {isRegister ? 'Register Account' : 'Sign In'}
              </Button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#E5E7EB]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-[#9CA3AF] font-medium">Or quick demo</span>
              </div>
            </div>

            {/* Fast 1-Click Demo Login */}
            <Button
              type="button"
              variant="secondary"
              onClick={handleDemoLogin}
              loading={loading}
              className="w-full border-red-200 hover:bg-[#FEF2F2] text-[#DC2626]"
              icon={<Sparkles className="w-4 h-4 text-[#DC2626]" />}
            >
              Continue as Demo Freelancer (Alex Rivera)
            </Button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError('');
                }}
                className="text-xs text-[#6B7280] hover:text-[#DC2626] font-medium"
              >
                {isRegister
                  ? 'Already have an account? Sign in'
                  : "Don't have an account? Create one"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
