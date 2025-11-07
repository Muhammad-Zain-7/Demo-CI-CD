export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: any;
  error?: Error;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatMessage(entry: LogEntry): string {
    const { level, message, timestamp, context, error } = entry;
    
    let formattedMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    
    if (context) {
      formattedMessage += ` | Context: ${JSON.stringify(context)}`;
    }
    
    if (error) {
      formattedMessage += ` | Error: ${error.message}`;
      if (this.isDevelopment && error.stack) {
        formattedMessage += ` | Stack: ${error.stack}`;
      }
    }
    
    return formattedMessage;
  }

  private log(level: LogLevel, message: string, context?: any, error?: Error): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error
    };

    const formattedMessage = this.formatMessage(entry);

    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedMessage);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage);
        break;
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          console.debug(formattedMessage);
        }
        break;
    }
  }

  error(message: string, context?: any, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  warn(message: string, context?: any): void {
    this.log(LogLevel.WARN, message, context);
  }

  info(message: string, context?: any): void {
    this.log(LogLevel.INFO, message, context);
  }

  debug(message: string, context?: any): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  // API-specific logging methods
  apiRequest(method: string, url: string, context?: any): void {
    this.info(`API Request: ${method} ${url}`, context);
  }

  apiResponse(method: string, url: string, statusCode: number, duration: number, context?: any): void {
    this.info(`API Response: ${method} ${url} - ${statusCode} (${duration}ms)`, context);
  }

  apiError(method: string, url: string, error: Error, context?: any): void {
    this.error(`API Error: ${method} ${url}`, context, error);
  }

  // Database-specific logging methods
  dbQuery(operation: string, collection: string, context?: any): void {
    this.debug(`DB Query: ${operation} on ${collection}`, context);
  }

  dbError(operation: string, collection: string, error: Error, context?: any): void {
    this.error(`DB Error: ${operation} on ${collection}`, context, error);
  }

  // Business logic logging methods
  userAction(action: string, userId?: string, context?: any): void {
    this.info(`User Action: ${action}`, { userId, ...context });
  }

  businessEvent(event: string, context?: any): void {
    this.info(`Business Event: ${event}`, context);
  }
}

export const logger = new Logger();
