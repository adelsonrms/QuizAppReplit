import React from 'react';
import logoImage from '@assets/logo.png';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center">
      <img src={logoImage} alt="AMS-QUIZ Logo" className="h-10 mr-2" />
      <span className="text-xl font-poppins font-bold text-secondary">AMS-QUIZ</span>
    </div>
  );
};

export default Logo;
