import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a duration in seconds to a human readable string
 * Example: 3665 seconds -> "1h 1m 5s"
 */
export function formatDuration(seconds: number): string {
  if (seconds === 0) return "0s";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  const parts = [];
  
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  
  if (remainingSeconds > 0 && hours === 0) { // Only show seconds if less than an hour
    parts.push(`${remainingSeconds}s`);
  }
  
  return parts.join(' ');
}
