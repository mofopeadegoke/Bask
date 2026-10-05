import { describe, expect, it } from 'vitest';
import { getErrorMessage } from './utils';

describe('getErrorMessage', () => {
  it('returns the message of an Error', () => {
    expect(getErrorMessage(new Error('Network down'))).toBe('Network down');
  });

  it('returns the message of a plain object with a string message', () => {
    expect(getErrorMessage({ message: 'Socket error' })).toBe('Socket error');
  });

  it('returns the fallback for values without a usable message', () => {
    expect(getErrorMessage(undefined)).toBe('Something went wrong.');
    expect(getErrorMessage({ message: 42 }, 'Failed')).toBe('Failed');
    expect(getErrorMessage(new Error(''), 'Failed')).toBe('Failed');
  });
});
