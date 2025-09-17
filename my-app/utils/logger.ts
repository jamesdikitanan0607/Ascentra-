declare const __DEV__: boolean;

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = __DEV__ ? LogLevel.DEBUG : LogLevel.ERROR;

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private formatMessage(level: string, message: string, ...args: any[]): void {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] [${level}] ${message}`;
    
    switch (level) {
      case 'ERROR':
        console.error(formattedMessage, ...args);
        break;
      case 'WARN':
        console.warn(formattedMessage, ...args);
        break;
      case 'INFO':
        console.info(formattedMessage, ...args);
        break;
      case 'DEBUG':
      default:
        console.log(formattedMessage, ...args);
        break;
    }
  }

  public debug(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      this.formatMessage('DEBUG', message, ...args);
    }
  }

  public info(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      this.formatMessage('INFO', message, ...args);
    }
  }

  public warn(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      this.formatMessage('WARN', message, ...args);
    }
  }

  public error(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      this.formatMessage('ERROR', message, ...args);
    }
  }

  // Convenience methods for common use cases
  public logAuthEvent(event: string, details?: any): void {
    this.info(`Auth Event: ${event}`, details);
  }

  public logNavigation(screen: string, params?: any): void {
    this.debug(`Navigation: ${screen}`, params);
  }

  public logApiCall(endpoint: string, method: string, status?: number): void {
    this.info(`API Call: ${method} ${endpoint}`, { status });
  }

  public logError(context: string, error: any): void {
    this.error(`Error in ${context}:`, error);
  }

  public logPerformance(operation: string, duration: number): void {
    this.debug(`Performance: ${operation} took ${duration}ms`);
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Export convenience functions for easier usage
export const logDebug = (message: string, ...args: any[]) => logger.debug(message, ...args);
export const logInfo = (message: string, ...args: any[]) => logger.info(message, ...args);
export const logWarn = (message: string, ...args: any[]) => logger.warn(message, ...args);
export const logError = (message: string, ...args: any[]) => logger.error(message, ...args);
export const logAuthEvent = (event: string, details?: any) => logger.logAuthEvent(event, details);
export const logNavigation = (screen: string, params?: any) => logger.logNavigation(screen, params);
export const logApiCall = (endpoint: string, method: string, status?: number) => logger.logApiCall(endpoint, method, status);
export const logErrorContext = (context: string, error: any) => logger.logError(context, error);
export const logPerformance = (operation: string, duration: number) => logger.logPerformance(operation, duration);