import {
  createJsonErrorResponseHandler,
  type ResponseHandler,
} from '@ai-sdk/provider-utils';
import { APICallError } from '@ai-sdk/provider';
import { z } from 'zod';

const dudoxxErrorDataSchema = z.object({
  error: z.object({
    message: z.string(),
    type: z.string().optional(),
    param: z.string().nullish(),
    code: z.string().nullish(),
  }),
});

export type DudoxxErrorData = z.infer<typeof dudoxxErrorDataSchema>;

export class DudoxxRateLimitError extends APICallError {
  constructor(message: string, public readonly retryAfter?: number) {
    super({
      message,
      url: '',
      requestBodyValues: {},
      statusCode: 429,
      responseHeaders: undefined,
      responseBody: undefined,
      isRetryable: true,
    });
  }
}

export class DudoxxTimeoutError extends APICallError {
  constructor(message: string, public readonly timeoutMs: number) {
    super({
      message,
      url: '',
      requestBodyValues: {},
      statusCode: 408,
      responseHeaders: undefined,
      responseBody: undefined,
      isRetryable: true,
    });
  }
}

export class DudoxxToolError extends Error {
  constructor(
    message: string,
    public readonly toolName: string,
    public readonly originalError?: Error,
  ) {
    super(message);
    this.name = 'DudoxxToolError';
  }
}

/**
 * Enhanced error handler with retry logic support
 */
export const dudoxxFailedResponseHandler: ResponseHandler<APICallError> =
  createJsonErrorResponseHandler({
    errorSchema: dudoxxErrorDataSchema,
    errorToMessage: data => data.error.message,
    isRetryable: (response) => {
      // Retry on rate limits, timeouts, and server errors
      const status = response.status;
      return status === 429 || status === 408 || (status >= 500 && status < 600);
    },
  });

/**
 * Exponential backoff utility for retries
 */
export async function exponentialBackoff(
  attempt: number,
  baseDelayMs: number = 1000,
  maxDelayMs: number = 60000,
  jitter: boolean = true,
): Promise<void> {
  const delay = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs);
  const jitterMs = jitter ? Math.random() * 1000 : 0;
  const totalDelay = delay + jitterMs;
  
  await new Promise(resolve => setTimeout(resolve, totalDelay));
}

/**
 * Retry wrapper for DUDOXX API calls
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  isRetryable: (error: any) => boolean = (error) => error.isRetryable === true,
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on last attempt or if error is not retryable
      if (attempt === maxRetries || !isRetryable(error)) {
        throw error;
      }
      
      // Apply exponential backoff
      await exponentialBackoff(attempt);
      
      console.warn(`DUDOXX API retry ${attempt + 1}/${maxRetries} after error:`, (error as Error).message);
    }
  }
  
  throw lastError;
}

/**
 * Enhanced error classification
 */
export function classifyError(error: any): {
  type: 'rate_limit' | 'timeout' | 'authentication' | 'validation' | 'server' | 'network' | 'unknown';
  isRetryable: boolean;
  retryAfter?: number;
} {
  if (error instanceof DudoxxRateLimitError) {
    return {
      type: 'rate_limit',
      isRetryable: true,
      retryAfter: error.retryAfter,
    };
  }
  
  if (error instanceof DudoxxTimeoutError) {
    return {
      type: 'timeout',
      isRetryable: true,
    };
  }
  
  if (error instanceof APICallError) {
    const status = error.statusCode;
    
    if (status === 401 || status === 403) {
      return { type: 'authentication', isRetryable: false };
    }
    
    if (status === 400 || status === 422) {
      return { type: 'validation', isRetryable: false };
    }
    
    if (status && status >= 500) {
      return { type: 'server', isRetryable: true };
    }
  }
  
  if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND') {
    return { type: 'network', isRetryable: true };
  }
  
  return { type: 'unknown', isRetryable: false };
}