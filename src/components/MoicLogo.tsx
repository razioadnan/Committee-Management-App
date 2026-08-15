import React from 'react';

interface MoicLogoProps {
  className?: string;
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
}

export const MoicLogo: React.FC<MoicLogoProps> = ({
  className = '',
  size = 'md',
}) => {
  // Height sizing
  const heightClass = size === 'sm' ? 'h-9' : size === 'lg' ? 'h-16' : 'h-12';

  return (
    <div className={`flex items-center select-none ${className}`}>
      <img
        src="/moic-logo.png"
        alt="Model OIC Diplomatic Simulation"
        className={`${heightClass} w-auto object-contain`}
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
