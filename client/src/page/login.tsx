import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/auth-provider';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/Alert';
import { AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearErrors } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err) {
      // Error is handled in the auth context
      console.error('Login error:', err);
    }
  };

  const handleGoogleLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    setGoogleLoading(true);
    // Open Google login in the same window to prevent flickering
    window.location.href = '/auth/google';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-slate-800 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Sign in to your account
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Enter your credentials to access your workspace
          </p>
        </div>

        {error && (
          <Alert variant="destructive" onClose={clearErrors}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="mt-1"
                autoFocus
              />
            </div>
            <div>
              <div className="flex justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !email || !password}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
              >
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
                    Connecting to Google...
                  </div>
                ) : (
                  <>
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.61z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Sign in with Google
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;