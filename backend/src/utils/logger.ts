/**
 * Simple logger utility for application-wide logging
 * Provides different log levels and can be extended to use external logging services
 */

class Logger {
  private enabledLevels = ['info', 'warn', 'error'];
  
  constructor() {
    // Configuration could be extended to read from environment
  }
  
  /**
   * Log informational messages
   */
  info(message: string, ...args: any[]): void {
    if (this.enabledLevels.includes('info')) {
      console.log(`[INFO] ${message}`, ...args);
    }
  }
  
  /**
   * Log warning messages
   */
  warn(message: string, ...args: any[]): void {
    if (this.enabledLevels.includes('warn')) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }
  
  /**
   * Log error messages
   */
  error(message: string, ...args: any[]): void {
    if (this.enabledLevels.includes('error')) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }
  
  /**
   * Log debug messages (only in development)
   */
  debug(message: string, ...args: any[]): void {
    if (process.env.NODE_ENV === 'development' && this.enabledLevels.includes('debug')) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }
}

// Export a singleton instance
const logger = new Logger();
export default logger;