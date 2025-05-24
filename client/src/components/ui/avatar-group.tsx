import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  className?: string;
}

export const AvatarGroup = ({ 
  children, 
  max = 4, 
  className 
}: AvatarGroupProps) => {
  const childArray = React.Children.toArray(children);
  const showCount = childArray.length > max;
  const visibleAvatars = showCount ? childArray.slice(0, max) : childArray;
  const remainingCount = childArray.length - max;

  return (
    <div 
      className={cn(
        "flex -space-x-2 overflow-hidden",
        className
      )}
    >
      {visibleAvatars.map((child, index) => (
        <div 
          key={index} 
          className="ring-2 ring-background rounded-full"
        >
          {child}
        </div>
      ))}
      
      {showCount && (
        <div className="ring-2 ring-background rounded-full">
          <Avatar className="h-6 w-6 bg-gray-200 text-gray-600">
            <AvatarFallback className="text-xs font-medium">
              +{remainingCount}
            </AvatarFallback>
          </Avatar>
        </div>
      )}
    </div>
  );
};