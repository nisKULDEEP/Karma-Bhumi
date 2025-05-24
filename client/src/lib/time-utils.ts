/**
 * Utilities for formatting and working with time in the time tracking feature
 */

/**
 * Format seconds into a human-readable time string (HH:MM:SS)
 */
export const formatTimeFromSeconds = (seconds: number): string => {
  if (!seconds && seconds !== 0) return "00:00:00";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    secs.toString().padStart(2, '0')
  ].join(':');
};

/**
 * Format seconds into a human-readable duration (e.g., "2h 30m")
 */
export const formatDuration = (seconds: number): string => {
  if (!seconds && seconds !== 0) return "0m";
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes > 0 ? minutes + 'm' : ''}`;
  }
  
  return `${minutes}m`;
};

/**
 * Calculate the duration between two dates in seconds
 */
export const calculateDuration = (startTime: Date, endTime?: Date): number => {
  const end = endTime || new Date();
  return Math.floor((end.getTime() - startTime.getTime()) / 1000);
};

/**
 * Format a date to YYYY-MM-DD format
 */
export const formatDateToYYYYMMDD = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * Format a date to a more readable format (e.g., "May 2, 2023")
 */
export const formatReadableDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};