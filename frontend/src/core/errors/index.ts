export class BaseError extends Error {
  public statusCode: number;
  public details?: any;

  constructor(message: string, statusCode: number = 500, details?: any) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ApiError extends BaseError {
  constructor(message: string, statusCode: number = 500, details?: any) {
    super(message, statusCode, details);
  }
}

export class ValidationError extends BaseError {
  constructor(message: string, details?: any) {
    super(message, 400, details);
  }
}

export class NetworkError extends BaseError {
  constructor(message: string = 'تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.') {
    super(message, 0);
  }
}

export class PermissionError extends BaseError {
  constructor(message: string = 'ليس لديك صلاحية لإجراء هذه العملية.') {
    super(message, 403);
  }
}

export class BusinessError extends BaseError {
  constructor(message: string, details?: any) {
    super(message, 422, details);
  }
}

export const handleError = (error: unknown): BaseError => {
  if (error instanceof BaseError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new BaseError(error.message);
  }
  
  return new BaseError('حدث خطأ غير معروف.');
};
