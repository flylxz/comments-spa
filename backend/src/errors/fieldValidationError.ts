export class FieldValidationError extends Error {
  readonly field: string;
  readonly statusCode = 400;

  constructor(field: string, message: string) {
    super(message);
    this.name = 'FieldValidationError';
    this.field = field;
  }
}
