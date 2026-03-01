'use client';

import { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

interface FavoriteButtonProps {
  propertyId: string;
  userId?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onLoginRequired?: () => void;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
};

export default function FavoriteButton({
  propertyId,
  userId,
  size = 'md',
  className = '',
  onLoginRequired,
}: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  // Check initial favorite status
  useEffect(() => {
    if (!userId) {
      setIsChecking(false);
      return;
    }

    const checkFavorite = async () => {
      try {
        const res = await fetch(`/api/favorites?propertyId=${propertyId}`);
        const data = await res.json();
        if (res.ok) {
          setIsFavorited(data.isFavorited);
        }
      } catch (error) {
        console.error('Failed to check favorite status:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkFavorite();
  }, [propertyId, userId]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      onLoginRequired?.();
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsFavorited(data.isFavorited);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading || isChecking}
      className={`
        ${sizeClasses[size]}
        flex items-center justify-center
        rounded-full
        transition-all duration-200
        ${isFavorited
          ? 'bg-red-100 text-red-500 hover:bg-red-200'
          : 'bg-white/90 backdrop-blur-sm text-gray-400 hover:text-red-500 hover:bg-white'
        }
        ${isLoading ? 'animate-pulse' : ''}
        shadow-md hover:shadow-lg
        disabled:cursor-not-allowed
        ${className}
      `}
      aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
      title={userId ? (isFavorited ? 'Remove from favorites' : 'Add to favorites') : 'Login to save favorites'}
    >
      {isChecking ? (
        <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
      ) : isFavorited ? (
        <FaHeart className="drop-shadow-sm" />
      ) : (
        <FaRegHeart />
      )}
    </button>
  );
}
