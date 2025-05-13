import React from 'react';
import { Link } from 'wouter';

const Footer: React.FC = () => {
  return (
    <footer className="bg-primary text-secondary py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-poppins font-semibold text-lg mb-4">AMS-QUIZ</h3>
            <p className="mb-4 text-sm opacity-80">
              Online quiz platform specialized in content about the Cayman Islands.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-secondary hover:text-accent transition-colors">
                <i className="ri-facebook-fill text-xl"></i>
              </a>
              <a href="#" className="text-secondary hover:text-accent transition-colors">
                <i className="ri-instagram-line text-xl"></i>
              </a>
              <a href="#" className="text-secondary hover:text-accent transition-colors">
                <i className="ri-twitter-fill text-xl"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-poppins font-semibold text-lg mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <i className="ri-mail-line mr-2 mt-1"></i>
                <span>contact@amsquiz.com</span>
              </li>
              <li className="flex items-start">
                <i className="ri-phone-line mr-2 mt-1"></i>
                <span>+1 (345) 999-8888</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-secondary border-opacity-20 mt-8 pt-6 text-center text-sm opacity-80">
          <p>&copy; {new Date().getFullYear()} Devonno Soluções Digitais. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
