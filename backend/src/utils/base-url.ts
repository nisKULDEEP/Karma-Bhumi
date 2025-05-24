import { config } from "../config/app.config";

// API base URL constant to avoid duplication in routes
export const API_BASE_URL = config.BASE_PATH;

// Helper function to construct API endpoints
export const createApiEndpoint = (path: string): string => {
  // Ensure we don't have duplicate base paths
  if (path.startsWith(API_BASE_URL)) {
    return path;
  }
  
  // Ensure path starts with a slash
  const formattedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${formattedPath}`;
};