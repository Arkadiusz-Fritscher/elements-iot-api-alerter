import logger from "./loggerModule";

class AppError extends Error {
  public readonly message: string;
  public readonly statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.message = message;
    this.statusCode = statusCode;
  }

  public log(meta?: { service?: string; method?: string; [key: string]: any }): void {
    logger.error(this.message, meta);
    throw this;
  }
}

export default AppError;
