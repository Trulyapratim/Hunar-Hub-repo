import React from 'react';

interface AvatarProps {
  name: string;
  color?: string;
  url?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ name, color, url, size = 'md', className = '' }) => {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-20 h-20 text-xl',
    xl: 'w-32 h-32 text-3xl',
  };

  const styles = color ? { backgroundColor: color } : {};

  if (url) {
    return (
      <img 
        src={url} 
        alt={name} 
        className={`rounded-full object-cover shrink-0 ${sizeClasses[size]} ${className} shadow-sm`}
        referrerPolicy="no-referrer"
        onError={(e) => {
          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color?.replace('#', '') || '0D8ABC'}&color=fff`;
        }}
      />
    );
  }

  return (
    <div 
      className={`rounded-full flex items-center justify-center font-bold text-white shadow-sm shrink-0 ${sizeClasses[size]} ${className}`}
      style={styles}
    >
      {initials}
    </div>
  );
};
