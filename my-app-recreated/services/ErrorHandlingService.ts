/**
 * Centralized Error Handling Service
 * Provides consistent error handling, user-friendly messages, and retry logic
 */

export interface ErrorInfo {
  type: 'network' | 'data' | 'permission' | 'validation' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  userMessage: string;
  technicalMessage: string;
  suggestions: string[];
  retryable: boolean;
}

export interface RetryConfig {
  maxAttempts: number;
  delay: number;
  backoffMultiplier?: number;
}

class ErrorHandlingService {
  private static instance: ErrorHandlingService;
  
  private readonly defaultRetryConfig: RetryConfig = {
    maxAttempts: 3,
    delay: 2000,
    backoffMultiplier: 1.5,
  };

  public static getInstance(): ErrorHandlingService {
    if (!ErrorHandlingService.instance) {
      ErrorHandlingService.instance = new ErrorHandlingService();
    }
    return ErrorHandlingService.instance;
  }

  /**
   * Analyzes an error and returns structured error information
   */
  public analyzeError(error: any, context?: string): ErrorInfo {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const lowerMessage = errorMessage.toLowerCase();

    // Network-related errors
    if (this.isNetworkError(lowerMessage)) {
      return {
        type: 'network',
        severity: 'medium',
        userMessage: 'Connection issue detected',
        technicalMessage: errorMessage,
        suggestions: [
          'Check your internet connection',
          'Try again in a moment',
          'Switch to a different network if available'
        ],
        retryable: true,
      };
    }

    // Data-related errors
    if (this.isDataError(lowerMessage)) {
      return {
        type: 'data',
        severity: 'medium',
        userMessage: 'Data unavailable',
        technicalMessage: errorMessage,
        suggestions: [
          'This information may be temporarily unavailable',
          'Try refreshing the data',
          'Check back later for updates'
        ],
        retryable: true,
      };
    }

    // Permission errors
    if (this.isPermissionError(lowerMessage)) {
      return {
        type: 'permission',
        severity: 'high',
        userMessage: 'Access denied',
        technicalMessage: errorMessage,
        suggestions: [
          'Check app permissions in device settings',
          'Grant required permissions for full functionality',
          'Restart the app after changing permissions'
        ],
        retryable: false,
      };
    }

    // Validation errors
    if (this.isValidationError(lowerMessage)) {
      return {
        type: 'validation',
        severity: 'low',
        userMessage: 'Invalid data provided',
        technicalMessage: errorMessage,
        suggestions: [
          'Check the information entered',
          'Ensure all required fields are filled',
          'Contact support if the issue persists'
        ],
        retryable: false,
      };
    }

    // Unknown errors
    return {
      type: 'unknown',
      severity: 'medium',
      userMessage: 'Something went wrong',
      technicalMessage: errorMessage,
      suggestions: [
        'Try the action again',
        'Restart the app if the problem continues',
        'Contact support if needed'
      ],
      retryable: true,
    };
  }

  /**
   * Gets context-specific error messages for different app features
   */
  public getContextualErrorMessage(error: any, context: string): string {
    const errorInfo = this.analyzeError(error, context);
    
    switch (context) {
      case 'weather':
        return this.getWeatherErrorMessage(errorInfo);
      case 'trails':
        return this.getTrailsErrorMessage(errorInfo);
      case 'location':
        return this.getLocationErrorMessage(errorInfo);
      case 'reviews':
        return this.getReviewsErrorMessage(errorInfo);
      default:
        return errorInfo.userMessage;
    }
  }

  /**
   * Implements retry logic with exponential backoff
   */
  public async retryOperation<T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {}
  ): Promise<T> {
    const finalConfig = { ...this.defaultRetryConfig, ...config };
    let lastError: any;

    for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === finalConfig.maxAttempts) {
          throw error;
        }

        const errorInfo = this.analyzeError(error);
        if (!errorInfo.retryable) {
          throw error;
        }

        const delay = finalConfig.delay * Math.pow(finalConfig.backoffMultiplier || 1, attempt - 1);
        await this.delay(delay);
      }
    }

    throw lastError;
  }

  /**
   * Logs errors for debugging and analytics
   */
  public logError(error: any, context?: string, additionalInfo?: any): void {
    const errorInfo = this.analyzeError(error, context);
    
    console.error('Error logged:', {
      context,
      type: errorInfo.type,
      severity: errorInfo.severity,
      userMessage: errorInfo.userMessage,
      technicalMessage: errorInfo.technicalMessage,
      additionalInfo,
      timestamp: new Date().toISOString(),
    });

    // In production, you would send this to your analytics service
    // Analytics.logError(errorInfo, context, additionalInfo);
  }

  private isNetworkError(message: string): boolean {
    const networkKeywords = [
      'network', 'fetch', 'timeout', 'connection', 'offline',
      'unreachable', 'dns', 'socket', 'cors', 'xhr'
    ];
    return networkKeywords.some(keyword => message.includes(keyword));
  }

  private isDataError(message: string): boolean {
    const dataKeywords = [
      'no data', 'not found', 'empty', 'invalid data',
      'corrupted', 'missing', 'unavailable'
    ];
    return dataKeywords.some(keyword => message.includes(keyword));
  }

  private isPermissionError(message: string): boolean {
    const permissionKeywords = [
      'permission', 'unauthorized', 'forbidden', 'access denied',
      'not allowed', 'restricted'
    ];
    return permissionKeywords.some(keyword => message.includes(keyword));
  }

  private isValidationError(message: string): boolean {
    const validationKeywords = [
      'validation', 'invalid', 'required', 'format',
      'constraint', 'schema'
    ];
    return validationKeywords.some(keyword => message.includes(keyword));
  }

  private getWeatherErrorMessage(errorInfo: ErrorInfo): string {
    switch (errorInfo.type) {
      case 'network':
        return 'Unable to fetch weather data. Check your connection and try again.';
      case 'data':
        return 'Weather information is temporarily unavailable for this location.';
      case 'permission':
        return 'Location access needed for accurate weather data.';
      default:
        return 'Weather data unavailable. You can still plan your hike using general forecasts.';
    }
  }

  private getTrailsErrorMessage(errorInfo: ErrorInfo): string {
    switch (errorInfo.type) {
      case 'network':
        return 'Unable to load trail maps. Check your connection and try again.';
      case 'data':
        return 'Trail information is not available for this location yet.';
      case 'validation':
        return 'Invalid location data. Please try selecting a different hiking spot.';
      default:
        return 'Trail maps unavailable. You can still explore this hiking area.';
    }
  }

  private getLocationErrorMessage(errorInfo: ErrorInfo): string {
    switch (errorInfo.type) {
      case 'permission':
        return 'Location permission required. Please enable in device settings.';
      case 'network':
        return 'Unable to determine your location. Check GPS and network settings.';
      default:
        return 'Location services unavailable. You can manually search for hiking spots.';
    }
  }

  private getReviewsErrorMessage(errorInfo: ErrorInfo): string {
    switch (errorInfo.type) {
      case 'network':
        return 'Unable to load reviews. Check your connection and try again.';
      case 'data':
        return 'No reviews available for this hiking spot yet.';
      default:
        return 'Reviews temporarily unavailable. Try again later.';
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default ErrorHandlingService.getInstance();