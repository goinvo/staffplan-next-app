import React from 'react';
import Link
 from 'next/link';
const Navbar: React.FC = () => {
  return (
    <nav className="bg-gray-100 p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <div className="placeholder-logo">Logo</div>
        <Link href="/projects" className="hover:underline">Projects</Link>
        <Link href="#" className="hover:underline">People</Link>
      </div>
    </nav>
  );
};

export default Navbar;