/**
 * Configuration utilities for DUDOXX provider
 * Enforces environment variable requirements without hardcoded fallbacks
 */

import { DudoxxChatModelId } from './dudoxx-chat-settings';
import { DudoxxEmbeddingModelId } from './dudoxx-embedding-settings';

/**
 * Get required DUDOXX chat model name from environment
 * @param envVarName - Environment variable name (default: 'DUDOXX_MODEL_NAME')
 * @returns Model ID from environment variable
 * @throws Error if environment variable is not set
 */
export function getRequiredChatModel(envVarName: string = 'DUDOXX_MODEL_NAME'): DudoxxChatModelId {
  const modelName = process.env[envVarName];
  if (!modelName) {
    throw new Error(
      `${envVarName} environment variable is required. Please set it in your .env file (e.g., ${envVarName}=dudoxx)`
    );
  }
  return modelName as DudoxxChatModelId;
}

/**
 * Get required DUDOXX reasoning model name from environment
 * @param envVarName - Environment variable name (default: 'DUDOXX_REASONING_MODEL_NAME')
 * @returns Model ID from environment variable
 * @throws Error if environment variable is not set
 */
export function getRequiredReasoningModel(envVarName: string = 'DUDOXX_REASONING_MODEL_NAME'): DudoxxChatModelId {
  const modelName = process.env[envVarName];
  if (!modelName) {
    throw new Error(
      `${envVarName} environment variable is required. Please set it in your .env file (e.g., ${envVarName}=dudoxx-reasoning)`
    );
  }
  return modelName as DudoxxChatModelId;
}

/**
 * Get required DUDOXX embedding model name from environment
 * @param envVarName - Environment variable name (default: 'DUDOXX_EMBEDDING_MODEL_NAME')
 * @returns Model ID from environment variable
 * @throws Error if environment variable is not set
 */
export function getRequiredEmbeddingModel(envVarName: string = 'DUDOXX_EMBEDDING_MODEL_NAME'): DudoxxEmbeddingModelId {
  const modelName = process.env[envVarName];
  if (!modelName) {
    throw new Error(
      `${envVarName} environment variable is required. Please set it in your .env file (e.g., ${envVarName}=embedder)`
    );
  }
  return modelName as DudoxxEmbeddingModelId;
}

/**
 * Get required DUDOXX base URL from environment
 * @param envVarName - Environment variable name (default: 'DUDOXX_BASE_URL')
 * @returns Base URL from environment variable
 * @throws Error if environment variable is not set
 */
export function getRequiredBaseURL(envVarName: string = 'DUDOXX_BASE_URL'): string {
  const baseURL = process.env[envVarName];
  if (!baseURL) {
    throw new Error(
      `${envVarName} environment variable is required. Please set it in your .env file (e.g., ${envVarName}=https://llm-router.dudoxx.com/v1)`
    );
  }
  return baseURL;
}

/**
 * Validate all required DUDOXX environment variables
 * @throws Error with detailed message about missing variables
 */
export function validateDudoxxEnvironment(): void {
  const requiredVars = [
    'DUDOXX_API_KEY',
    'DUDOXX_BASE_URL', 
    'DUDOXX_MODEL_NAME',
    'DUDOXX_REASONING_MODEL_NAME',
    'DUDOXX_EMBEDDING_MODEL_NAME'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required DUDOXX environment variables: ${missing.join(', ')}\n` +
      'Please set them in your .env file:\n' +
      '  DUDOXX_API_KEY=your_api_key\n' +
      '  DUDOXX_BASE_URL=https://llm-router.dudoxx.com/v1\n' +
      '  DUDOXX_MODEL_NAME=dudoxx\n' +
      '  DUDOXX_REASONING_MODEL_NAME=dudoxx-reasoning\n' +
      '  DUDOXX_EMBEDDING_MODEL_NAME=embedder'
    );
  }
}