import React from 'react';
import { Link } from 'wouter';
import Logo from './ui/logo';

const Header: React.FC = () => {
  return (
    <header className="bg-primary shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/">
            <a>
              <Logo />
            </a>
          </Link>
        </div>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link href="/">
                <a className="text-secondary hover:text-accent-light transition-colors font-poppins font-medium">
                  Home
                </a>
              </Link>
            </li>
            <li className="hidden md:block">
              <Link href="/about">
                <a className="text-secondary hover:text-accent-light transition-colors font-poppins font-medium">
                  About
                </a>
              </Link>
            </li>
            <li className="hidden md:block">
              <Link href="/contact">
                <a className="text-secondary hover:text-accent-light transition-colors font-poppins font-medium">
                  Contact
                </a>
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
