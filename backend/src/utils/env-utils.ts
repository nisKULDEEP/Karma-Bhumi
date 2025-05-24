/**
 * Gets environment variables with type safety and fallback
 * @param key The environment variable key to retrieve
 * @param defaultValue Optional default value if the environment variable is not set
 * @returns The environment variable value as a string
 * @throws Error if the environment variable is not set and no default value is provided
 */
export const getEnv = (key: string, defaultValue: string = ""): string => {
  const value = process.env[key];
  if (value === undefined) {
    if (defaultValue) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
};