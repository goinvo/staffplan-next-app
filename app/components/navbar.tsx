import React from 'react';
import Link from 'next/link';
import { ChatBubbleBottomCenterTextIcon, BellIcon } from "@heroicons/react/24/outline";

const Navbar: React.FC = () => {
  return (
    <nav className="navbar bg-gray-100 px-4 h-14 flex justify-between items-center">
      <div className="flex items-center space-x-4 h-full">
        <div className="placeholder-logo">Logo</div>
        <Link href="/projects" className="flex h-full justify-between items-center hover:underline">Projects</Link>
        <Link href="#" className="flex h-full justify-between items-center border-b-2 navbar-border-accent hover:underline"><b>People</b></Link>
      </div>
      <div className="flex items-center space-x-4 py-4">
        <Link href="#" className="navbar-text-accent hover:underline">My Plan</Link>
        <div className='h-4 w-4'><ChatBubbleBottomCenterTextIcon /></div>
        <div className='h-4 w-4'><BellIcon /></div>

        <div>Hi, Jennifer!</div>
      </div>
    </nav>
  );
};

export default Navbar;