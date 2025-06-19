import { describe, it, expect, vi } from 'vitest';
import {
  DudoxxRateLimitError,
  DudoxxTimeoutError,
  DudoxxToolError,
  exponentialBackoff,
  withRetry,
  classifyError,
} from './dudoxx-error';
import { APICallError } from '@ai-sdk/provider';

describe('DudoxxRateLimitError', () => {
  it('should create rate limit error with retry after', () => {
    const error = new DudoxxRateLimitError('Rate limit exceeded', 60);
    
    expect(error.message).toBe('Rate limit exceeded');
    expect(error.statusCode).toBe(429);
    expect(error.retryAfter).toBe(60);
    expect(error.isRetryable).toBe(true);
  });
});

describe('DudoxxTimeoutError', () => {
  it('should create timeout error with timeout duration', () => {
    const error = new DudoxxTimeoutError('Request timeout', 30000);
    
    expect(error.message).toBe('Request timeout');
    expect(error.statusCode).toBe(408);
    expect(error.timeoutMs).toBe(30000);
    expect(error.isRetryable).toBe(true);
  });
});

describe('DudoxxToolError', () => {
  it('should create tool error with tool name and original error', () => {
    const originalError = new Error('Original failure');
    const error = new DudoxxToolError('Tool execution failed', 'weather-tool', originalError);
    
    expect(error.message).toBe('Tool execution failed');
    expect(error.toolName).toBe('weather-tool');
    expect(error.originalError).toBe(originalError);
    expect(error.name).toBe('DudoxxToolError');
  });
});

describe('exponentialBackoff', () => {
  it('should calculate correct delay for each attempt', async () => {
    const startTime = Date.now();
    
    await exponentialBackoff(0, 100, 10000, false);
    const delay0 = Date.now() - startTime;
    
    expect(delay0).toBeGreaterThanOrEqual(100);
    expect(delay0).toBeLessThan(200);
  });

  it('should respect maximum delay', async () => {
    const startTime = Date.now();
    
    await exponentialBackoff(10, 1000, 2000, false);
    const delay = Date.now() - startTime;
    
    expect(delay).toBeGreaterThanOrEqual(2000);
    expect(delay).toBeLessThan(2100);
  });

  it('should add jitter when enabled', async () => {
    const delays: number[] = [];
    
    for (let i = 0; i < 5; i++) {
      const startTime = Date.now();
      await exponentialBackoff(1, 100, 10000, true);
      delays.push(Date.now() - startTime);
    }
    
    // With jitter, delays should vary
    const uniqueDelays = new Set(delays.map(d => Math.floor(d / 10)));
    expect(uniqueDelays.size).toBeGreaterThan(1);
  });
});

describe('withRetry', () => {
  it('should succeed on first attempt', async () => {
    const mockFn = vi.fn().mockResolvedValue('success');
    
    const result = await withRetry(mockFn, 3);
    
    expect(result).toBe('success');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should retry on retryable errors', async () => {
    let attemptCount = 0;
    const mockFn = vi.fn().mockImplementation(() => {
      attemptCount++;
      if (attemptCount < 3) {
        const error = new Error('Retryable error');
        (error as any).isRetryable = true;
        throw error;
      }
      return 'success after retries';
    });
    
    const result = await withRetry(mockFn, 3);
    
    expect(result).toBe('success after retries');
    expect(mockFn).toHaveBeenCalledTimes(3);
  });

  it('should not retry on non-retryable errors', async () => {
    const mockFn = vi.fn().mockImplementation(() => {
      const error = new Error('Non-retryable error');
      (error as any).isRetryable = false;
      throw error;
    });
    
    await expect(withRetry(mockFn, 3)).rejects.toThrow('Non-retryable error');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should fail after max retries', async () => {
    const mockFn = vi.fn().mockImplementation(() => {
      const error = new Error('Always fails');
      (error as any).isRetryable = true;
      throw error;
    });
    
    await expect(withRetry(mockFn, 2)).rejects.toThrow('Always fails');
    expect(mockFn).toHaveBeenCalledTimes(3); // initial + 2 retries
  });

  it('should use custom isRetryable function', async () => {
    const mockFn = vi.fn().mockRejectedValue(new Error('Custom error'));
    const customIsRetryable = vi.fn().mockReturnValue(false);
    
    await expect(withRetry(mockFn, 3, customIsRetryable)).rejects.toThrow('Custom error');
    
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(customIsRetryable).toHaveBeenCalledWith(expect.any(Error));
  });
});

describe('classifyError', () => {
  it('should classify DudoxxRateLimitError', () => {
    const error = new DudoxxRateLimitError('Rate limit', 60);
    const classification = classifyError(error);
    
    expect(classification.type).toBe('rate_limit');
    expect(classification.isRetryable).toBe(true);
    expect(classification.retryAfter).toBe(60);
  });

  it('should classify DudoxxTimeoutError', () => {
    const error = new DudoxxTimeoutError('Timeout', 30000);
    const classification = classifyError(error);
    
    expect(classification.type).toBe('timeout');
    expect(classification.isRetryable).toBe(true);
  });

  it('should classify authentication errors', () => {
    const error = new APICallError({
      message: 'Unauthorized',
      url: 'test',
      requestBodyValues: {},
      statusCode: 401,
      responseHeaders: undefined,
      responseBody: undefined,
    });
    
    const classification = classifyError(error);
    
    expect(classification.type).toBe('authentication');
    expect(classification.isRetryable).toBe(false);
  });

  it('should classify validation errors', () => {
    const error = new APICallError({
      message: 'Bad request',
      url: 'test',
      requestBodyValues: {},
      statusCode: 400,
      responseHeaders: undefined,
      responseBody: undefined,
    });
    
    const classification = classifyError(error);
    
    expect(classification.type).toBe('validation');
    expect(classification.isRetryable).toBe(false);
  });

  it('should classify server errors', () => {
    const error = new APICallError({
      message: 'Internal server error',
      url: 'test',
      requestBodyValues: {},
      statusCode: 500,
      responseHeaders: undefined,
      responseBody: undefined,
    });
    
    const classification = classifyError(error);
    
    expect(classification.type).toBe('server');
    expect(classification.isRetryable).toBe(true);
  });

  it('should classify network errors', () => {
    const error = new Error('Network error');
    (error as any).code = 'ECONNRESET';
    
    const classification = classifyError(error);
    
    expect(classification.type).toBe('network');
    expect(classification.isRetryable).toBe(true);
  });

  it('should classify unknown errors', () => {
    const error = new Error('Unknown error');
    const classification = classifyError(error);
    
    expect(classification.type).toBe('unknown');
    expect(classification.isRetryable).toBe(false);
  });
});