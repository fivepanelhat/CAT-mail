enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

class Logger {
  private level: LogLevel = LogLevel.INFO;

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    return levels.indexOf(level) >= levels.indexOf(this.level);
  }

  private format(level: LogLevel, message: string, data?: unknown): string {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';
    return `[${timestamp}] [${level}] ${message}${dataStr}`;
  }

  debug(message: string, data?: unknown): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(this.format(LogLevel.DEBUG, message, data));
    }
  }

  info(message: string, data?: unknown): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.format(LogLevel.INFO, message, data));
    }
  }

  warn(message: string, data?: unknown): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.format(LogLevel.WARN, message, data));
    }
  }

  error(message: string, error?: Error | unknown): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const data = error instanceof Error ? error.message : error;
      console.error(this.format(LogLevel.ERROR, message, data));
    }
  }
}

export const logger = new Logger();
export { LogLevel };
