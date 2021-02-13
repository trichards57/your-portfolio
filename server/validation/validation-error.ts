export interface ValidationError<T> {
  fieldName: keyof T;
  error: string;
}
