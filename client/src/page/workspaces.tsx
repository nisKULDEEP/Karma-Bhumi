import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/auth-provider';
import { Button } from '../components/ui/Button';
import { PlusCircle } from 'lucide-react';

const WorkspacesPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Your Workspaces
          </h1>
          <Button className="flex items-center">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Workspace
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* If the user has a current workspace, show it first */}
          {user?.currentWorkspace && (
            <div className="bg-white dark:bg-slate-800 overflow-hidden shadow rounded-lg border dark:border-slate-700">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                    {user.name.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      My Workspace
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Your default workspace
                    </p>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/30 px-5 py-3">
                <Link 
                  to={`/workspace/${user.currentWorkspace}`} 
                  className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
                >
                  Enter workspace →
                </Link>
              </div>
            </div>
          )}

          {/* Example empty state */}
          {!user?.currentWorkspace && (
            <div className="col-span-full flex items-center justify-center bg-white dark:bg-slate-800 shadow rounded-lg border dark:border-slate-700 p-8">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No workspaces found
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Create your first workspace to get started
                </p>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Workspace
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkspacesPage;