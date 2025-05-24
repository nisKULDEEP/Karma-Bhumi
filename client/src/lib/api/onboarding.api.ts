import API from "../axios-client";

// Define types for organization setup payload
type OrganizationSetupData = {
  organization: {
    name: string;
    domain?: string;
    industry?: string;
    size?: string;
  };
  user: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  };
};

/**
 * Initiates the onboarding process by creating an organization and user
 * @param data The organization and user data
 * @returns A promise that resolves to the API response
 */
export const initiateOnboardingMutationFn = async (data: OrganizationSetupData) => {
  const response = await API.post("/onboarding/setup/organization", data);
  return response.data;
};

/**
 * Sets up a workspace during onboarding
 * @param data The workspace setup data
 * @returns A promise that resolves to the API response
 */
export const setupWorkspaceMutationFn = async (data: {
  name: string;
  description?: string;
  teamMembers?: string[];
}) => {
  const response = await API.post("/onboarding/setup/workspace", data);
  return response.data;
};

/**
 * Sets up a project during onboarding
 * @param data The project setup data
 * @returns A promise that resolves to the API response
 */
export const setupProjectMutationFn = async (data: {
  name: string;
  description?: string;
  templateId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customStatuses?: any[];
}) => {
  const response = await API.post("/onboarding/setup/project", data);
  return response.data;
};

/**
 * Gets the current onboarding status for the user
 * @returns A promise that resolves to the API response with onboarding status
 */
export const getOnboardingStatusQueryFn = async () => {
  const response = await API.get("/onboarding/status");
  return response.data;
};

/**
 * Gets available project templates
 * @returns A promise that resolves to the API response with templates
 */
export const getProjectTemplatesQueryFn = async () => {
  const response = await API.get("/onboarding/templates");
  return response.data;
};