import React from 'react';
import logoImage from '@assets/logo.png';

const Logo: React.FC = () => {
  return (
    <div className="flex items-center">
      <img src={logoImage} alt="AMS Cayman Logo" className="h-10 mr-2" />
    </div>
  );
};

export default Logo;
