import { Alert } from 'react-native';
import { getUserSettings } from './database';

export interface ErrorReport {
  id: string;
  timestamp: string;
  error: string;
  stack?: string;
  userAgent?: string;
  appVersion: string;
  platform: string;
  deviceInfo?: {
    model?: string;
    osVersion?: string;
    appVersion?: string;
  };
  userInfo?: {
    userId?: string;
    hasEntries?: boolean;
    totalEntries?: number;
  };
  context?: {
    screen?: string;
    action?: string;
    data?: any;
  };
}

class ErrorReportingService {
  private static instance: ErrorReportingService;
  private errorQueue: ErrorReport[] = [];
  private isReporting = false;

  private constructor() {}

  static getInstance(): ErrorReportingService {
    if (!ErrorReportingService.instance) {
      ErrorReportingService.instance = new ErrorReportingService();
    }
    return ErrorReportingService.instance;
  }

  async reportError(
    error: Error | string,
    context?: {
      screen?: string;
      action?: string;
      data?: any;
    }
  ): Promise<void> {
    try {
      const errorReport: ErrorReport = {
        id: this.generateId(),
        timestamp: new Date().toISOString(),
        error: typeof error === 'string' ? error : error.message,
        stack: error instanceof Error ? error.stack : undefined,
        appVersion: '1.0.0',
        platform: 'React Native',
        context,
      };

      // Add to queue
      this.errorQueue.push(errorReport);

      // Try to send immediately
      await this.sendErrorReports();

      // Log to console in development
      if (__DEV__) {
        console.error('Error Report:', errorReport);
      }
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }

  async reportUserFeedback(
    type: 'feedback' | 'bug',
    text: string,
    additionalInfo?: any
  ): Promise<void> {
    try {
      const feedbackReport: ErrorReport = {
        id: this.generateId(),
        timestamp: new Date().toISOString(),
        error: `User ${type}: ${text}`,
        appVersion: '1.0.0',
        platform: 'React Native',
        context: {
          screen: 'Settings',
          action: type,
          data: additionalInfo,
        },
      };

      // Add to queue
      this.errorQueue.push(feedbackReport);

      // Try to send immediately
      await this.sendErrorReports();
    } catch (reportingError) {
      console.error('Failed to report feedback:', reportingError);
    }
  }

  private async sendErrorReports(): Promise<void> {
    if (this.isReporting || this.errorQueue.length === 0) {
      return;
    }

    this.isReporting = true;

    try {
      // In a real app, you would send these to your backend
      // For now, we'll just log them and clear the queue
      
      const reports = [...this.errorQueue];
      this.errorQueue = [];

      // Simulate sending to backend
      await this.simulateBackendSend(reports);

      if (__DEV__) {
        console.log(`Sent ${reports.length} error reports to backend`);
      }
    } catch (error) {
      console.error('Failed to send error reports:', error);
      // Put reports back in queue for retry
      this.errorQueue.unshift(...this.errorQueue);
    } finally {
      this.isReporting = false;
    }
  }

  private async simulateBackendSend(reports: ErrorReport[]): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate occasional failure
    if (Math.random() < 0.1) {
      throw new Error('Simulated network failure');
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  async getErrorStats(): Promise<{
    totalErrors: number;
    recentErrors: number;
    lastError?: string;
  }> {
    // In a real app, this would fetch from your backend
    return {
      totalErrors: this.errorQueue.length,
      recentErrors: this.errorQueue.filter(
        report => 
          new Date(report.timestamp).getTime() > 
          Date.now() - 24 * 60 * 60 * 1000 // Last 24 hours
      ).length,
      lastError: this.errorQueue[this.errorQueue.length - 1]?.error,
    };
  }

  async clearErrorQueue(): Promise<void> {
    this.errorQueue = [];
  }

  // Global error handler
  setupGlobalErrorHandler(): void {
    const originalErrorHandler = ErrorUtils.setGlobalHandler;
    
    ErrorUtils.setGlobalHandler = (callback: (error: Error, isFatal?: boolean) => void) => {
      const wrappedCallback = async (error: Error, isFatal?: boolean) => {
        try {
          // Report the error
          await this.reportError(error, {
            screen: 'Unknown',
            action: 'Global Error',
            data: { isFatal },
          });

          // Show user-friendly error message
          if (isFatal) {
            Alert.alert(
              'App Error',
              'An unexpected error occurred. The app will restart.',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    // In a real app, you might restart the app here
                    console.log('App restart requested');
                  },
                },
              ]
            );
          }
        } catch (reportingError) {
          console.error('Failed to handle global error:', reportingError);
        }

        // Call original handler
        if (originalErrorHandler) {
          originalErrorHandler(callback);
        }
      };

      return wrappedCallback;
    };
  }
}

// Export singleton instance
export const errorReporting = ErrorReportingService.getInstance();

// Convenience functions
export const reportError = (error: Error | string, context?: any) => 
  errorReporting.reportError(error, context);

export const reportFeedback = (type: 'feedback' | 'bug', text: string, additionalInfo?: any) =>
  errorReporting.reportUserFeedback(type, text, additionalInfo);

// Setup global error handler when this module is imported
errorReporting.setupGlobalErrorHandler(); 