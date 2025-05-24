// Re-export all API functions
export * from './auth.api';
export * from './user.api';
export * from './workspace.api';
export * from './project.api';
export * from './task.api';
export * from './member.api';
export * from './onboarding.api';
export * from './board.api';
export * from './dashboard.api';
export * from './time-tracking.api';
export * from './team.api';
// Removed the export from taskApi.ts as it's now merged into task.api.ts

// Export the API instance for direct use if needed
export { default as API } from '../axios-client';