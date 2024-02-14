// components/ActionBar.tsx
import React from 'react';

const ActionBar: React.FC = () => {
  return (
    <div className="flex justify-between items-center bg-gray-50 p-4">
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 rounded-full border-2 border-gray-400 flex justify-center items-center">+</div>
        <div className="flex items-center space-x-1 bg-gray-200 p-1 rounded-full">
          <div className="w-8 h-8 flex justify-center items-center rounded-l-full bg-white">Sort</div>
          <div className="w-8 h-8 flex justify-center items-center rounded-r-full bg-white">Sidebar</div>
        </div>
        <div className="border-l-2 border-gray-400 h-6"></div>
        <button className="rounded-full bg-blue-500 text-white px-4 py-2">Filters</button>
        <input type="text" placeholder="Search" className="rounded p-2" />
      </div>
      <div className="flex items-center space-x-4">
        <span>Today</span>
        <div className="flex items-center space-x-1 bg-gray-200 p-1 rounded-full">
          <div className="px-4 py-1 rounded-l-full bg-white">Quarter</div>
          <div className="px-4 py-1 rounded-r-full bg-white">Year</div>
        </div>
      </div>
    </div>
  );
};

export default ActionBar;
