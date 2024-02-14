import React from 'react';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-gray-100 p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <div className="placeholder-logo">Logo</div>
        <a href="#" className="hover:underline">Projects</a>
        <a href="#" className="hover:underline">People</a>
      </div>
    </nav>
  );
};

export default Navbar;