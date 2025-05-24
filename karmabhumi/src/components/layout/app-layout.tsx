"use client";

import { ReactNode } from "react";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 p-4 border-r dark:bg-gray-800 flex flex-col">
        <div className="mb-4 font-semibold text-lg">Org Name (Placeholder)</div>
        <nav className="flex-grow">
          {/* Teams Section */}
          <div>
            <h3 className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">
              Teams
            </h3>
            <ul className="space-y-1">
              <li>
                <a
                  href="#"
                  className="block p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-sm"
                >
                  Team A (Placeholder)
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="block p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-sm"
                >
                  Team B (Placeholder)
                </a>
              </li>
            </ul>
          </div>

          {/* Projects Section */}
          <div className="mt-4">
            <h3 className="mt-4 text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">
              Projects
            </h3>
            <ul className="space-y-1">
              <li>
                <a
                  href="#"
                  className="block p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-sm"
                >
                  Project X (Placeholder)
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="block p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-sm"
                >
                  Project Y (Placeholder)
                </a>
              </li>
            </ul>
          </div>
        </nav>

        {/* User Profile/Logout Section */}
        <div className="mt-auto"> {/* This will push it to the bottom due to flex-grow on nav and flex-col on parent */}
          <h3 className="mt-4 text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">
            User
          </h3>
          <ul className="space-y-1">
            <li>
              <a
                href="#"
                className="block p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-sm"
              >
                User Profile (Placeholder)
              </a>
            </li>
            <li>
              <a
                href="#"
                className="block p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-sm"
              >
                Logout (Placeholder)
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
