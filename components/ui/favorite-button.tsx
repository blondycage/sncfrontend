"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

interface FavoriteButtonProps {
  listingId: string;
  isFavorited: boolean;
  onToggle?: (isFavorited: boolean) => void;
  size?: "sm" | "md" | "lg";
  variant?: "button" | "icon";
  className?: string;
}

export function FavoriteButton({
  listingId,
  isFavorited,
  onToggle,
  size = "md",
  variant = "button",
  className = ""
}: FavoriteButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [favorited, setFavorited] = useState(isFavorited);
  const { toast } = useToast();

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        toast({
          title: "Authentication required",
          description: "Please log in to save favorites",
          variant: "destructive"
        });
        return;
      }

      const method = favorited ? 'DELETE' : 'POST';
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings/${listingId}/favorite`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || `Failed to ${favorited ? 'remove' : 'add'} favorite`);
      }

      const data = await response.json();
      const newFavoriteState = !favorited;
      setFavorited(newFavoriteState);
      
      toast({
        title: "Success",
        description: data.message,
      });

      // Call the onToggle callback if provided
      onToggle?.(newFavoriteState);

    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to update favorite',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case "sm": return "sm";
      case "lg": return "lg";
      default: return "default";
    }
  };

  const getIconSize = () => {
    switch (size) {
      case "sm": return "h-3 w-3";
      case "lg": return "h-6 w-6";
      default: return "h-4 w-4";
    }
  };

  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size={getButtonSize()}
        onClick={handleToggle}
        disabled={isLoading}
        className={`${favorited ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-500 ${className}`}
        title={favorited ? "Remove from favorites" : "Add to favorites"}
      >
        <Star 
          className={`${getIconSize()} ${favorited ? 'fill-current' : ''} ${isLoading ? 'animate-pulse' : ''}`} 
        />
      </Button>
    );
  }

  return (
    <Button
      variant={favorited ? "default" : "outline"}
      size={getButtonSize()}
      onClick={handleToggle}
      disabled={isLoading}
      className={`${favorited ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : 'border-yellow-500 text-yellow-500 hover:bg-yellow-50'} ${className}`}
    >
      <Star 
        className={`${getIconSize()} mr-2 ${favorited ? 'fill-current' : ''} ${isLoading ? 'animate-pulse' : ''}`} 
      />
      {isLoading ? 'Updating...' : (favorited ? 'Favorited' : 'Add to Favorites')}
    </Button>
  );
}
