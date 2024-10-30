export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class NightscoutError extends ApiError {
  constructor(message: string, statusCode: number = 400) {
    super(message, statusCode, 'NIGHTSCOUT_ERROR')
  }
}

export class ValidationError extends ApiError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR')
  }
} 