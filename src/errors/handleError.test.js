import { newError } from './handleError';
import { EXCEPTION } from './errorDetails';

describe('newExceptionError', () => {
  test('String Exception', () => {
    const error = newError('Hello world');
    expect(error.debug).toBe('Hello world');
    expect(error.type).toBe(EXCEPTION);
  });
  test('Object Exception', () => {
    const error = newError({
      message: 'Hello world',
      code: 'CODE123',
    });
    expect(error.debug).toBe('Hello world');
    expect(error.code).toBe('CODE123');
    expect(error.type).toBe(EXCEPTION);
  });
  test('Error Exception', () => {
    const error = newError(new Error('Hello world'));
    expect(error.debug).toBe('Hello world');
    expect(error.type).toBe(EXCEPTION);
  });
});
