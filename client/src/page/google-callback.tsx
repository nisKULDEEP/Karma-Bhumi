import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/Button';
import { Alert, AlertDescription } from '../components/ui/Alert';
import { AlertCircle } from 'lucide-react';

const GoogleCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // The user should already be authenticated by this point
        // We just need to fetch the user data
        const { data } = await axios.get('/api/users/me');
        
        if (data.user) {
          if (data.user.currentWorkspace) {
            navigate(`/workspace/${data.user.currentWorkspace}`);
          } else {
            navigate('/workspaces');
          }
        } else {
          setError('Failed to get user data after Google login');
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error in Google callback:', err);
        setError('Authentication failed. Please try again.');
        setIsLoading(false);
      }
    };

    const status = searchParams.get('status');
    const errorParam = searchParams.get('error');

    if (status === 'failure') {
      setIsLoading(false);
      if (errorParam === 'authentication_failed') {
        setError('Authentication failed. Please try again.');
      } else if (errorParam === 'no_workspace') {
        setError('No workspace found for this account. Please contact support.');
      } else {
        setError('Failed to login with Google. Please try again.');
      }
    } else {
      fetchUserData();
    }
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-slate-800 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Google Authentication
          </h1>
          {isLoading ? (
            <div className="mt-4">
              <p className="text-gray-600 dark:text-gray-400">
                Processing your login...
              </p>
              <div className="mt-4 flex justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
              </div>
            </div>
          ) : (
            error && (
              <div className="mt-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
                <div className="mt-6">
                  <Button
                    onClick={() => navigate('/login')}
                    className="w-full"
                  >
                    Return to login
                  </Button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleCallbackPage;