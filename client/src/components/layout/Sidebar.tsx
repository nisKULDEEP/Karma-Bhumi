import { useState } from 'react';

const Sidebar = () => {
  const [expandedSpaces, setExpandedSpaces] = useState(true);
  
  return (
    <aside className="bg-white w-60 flex-shrink-0 border-r border-gray-200 flex flex-col">
      <div className="p-4">
        <div className="flex items-center">
          <div className="text-2xl font-semibold">ClickUp</div>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto">
        <ul className="px-2 space-y-1">
          <li>
            <a href="#" className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
              <span className="mr-3">🏠</span>
              <span>Home</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
              <span className="mr-3">🔔</span>
              <span>Notifications</span>
            </a>
          </li>
          <li>
            <a href="#" className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
              <span className="mr-3">🎯</span>
              <span>Goals</span>
            </a>
          </li>
        </ul>
        
        <div className="mt-4">
          <div 
            className="flex items-center justify-between px-4 py-2 text-gray-600 cursor-pointer"
            onClick={() => setExpandedSpaces(!expandedSpaces)}
          >
            <span>Spaces</span>
            <span>{expandedSpaces ? '▼' : '►'}</span>
          </div>
          
          {expandedSpaces && (
            <ul className="px-2 space-y-1">
              <li>
                <a href="#" className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                  <span className="mr-3">📦</span>
                  <span>Everything</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                  <span className="inline-block w-6 h-6 mr-3 bg-purple-500 rounded-md text-white text-center">D</span>
                  <span>Development</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                  <span className="inline-block w-6 h-6 mr-3 bg-yellow-500 rounded-md text-white text-center">M</span>
                  <span>Marketing</span>
                </a>
              </li>
              <li>
                <a href="#" className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                  <span className="inline-block w-6 h-6 mr-3 bg-pink-500 rounded-md text-white text-center">P</span>
                  <span>Product</span>
                </a>
              </li>
            </ul>
          )}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;