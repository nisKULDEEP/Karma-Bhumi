import { getEnv } from "./utils/env-utils";

// API base URL
export const API_BASE_URL = getEnv("API_URL", "http://localhost:8000/api/v1");

/**
 * Creates a consistent API endpoint path without duplicating the base path
 * @param path The endpoint path (without the base URL)
 * @returns The complete API endpoint URL
 */
export const createApiEndpoint = (path: string): string => {
  // Remove any leading slash from the path for consistent joining
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  // Prevent duplication of the /api/v1/ prefix
  if (cleanPath.startsWith('api/v1/')) {
    return `${API_BASE_URL.replace('/api/v1', '')}/${cleanPath}`;
  }
  
  return `${API_BASE_URL}/${cleanPath}`;
};
