import { z } from 'zod';
import validate from '../../backend/utils/validate.js';
import ApiError from '../../backend/utils/ApiError.js';

const schema = z.object({
  name: z.string().min(2, 'name too short'),
  age: z.number().positive('age must be positive'),
});

describe('validate', () => {
  test('returns parsed data for valid input', () => {
    const result = validate(schema, { name: 'Alice', age: 25 });
    expect(result).toEqual({ name: 'Alice', age: 25 });
  });

  test('strips unknown keys from input', () => {
    const result = validate(schema, { name: 'Alice', age: 25, extra: 'ignored' });
    expect(result).not.toHaveProperty('extra');
  });

  test('throws ApiError with statusCode 400 for invalid data', () => {
    let caught;
    try {
      validate(schema, { name: 'A', age: 25 });
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(ApiError);
    expect(caught.statusCode).toBe(400);
  });

  test('error message is taken from the first Zod issue', () => {
    let caught;
    try {
      validate(schema, { name: 'A', age: 25 });
    } catch (e) {
      caught = e;
    }
    expect(caught.message).toBe('name too short');
  });

  test('throws when a field has the wrong type', () => {
    expect(() => validate(schema, { name: 'Alice', age: 'not-a-number' })).toThrow();
  });

  test('throws when a required field is missing', () => {
    expect(() => validate(schema, { name: 'Alice' })).toThrow();
  });

  test('throws when given a completely empty object', () => {
    expect(() => validate(schema, {})).toThrow();
  });
});
