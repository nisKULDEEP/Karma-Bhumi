/**
 * Gets environment variables from import.meta.env with type safety and fallback
 * @param key The environment variable key to retrieve (without the VITE_ prefix)
 * @param defaultValue Optional default value if the environment variable is not set
 * @returns The environment variable value as a string
 * @throws Error if the environment variable is not set and no default value is provided
 */
export const getEnv = (key: string, defaultValue: string = ""): string => {
  const fullKey = `VITE_${key}`;
  // In Vite, environment variables are exposed on import.meta.env
  const value = import.meta.env[fullKey];
  
  if (value === undefined) {
    if (defaultValue) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${fullKey} is not set`);
  }
  return value;
};