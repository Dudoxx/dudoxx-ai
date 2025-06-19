export { createDudoxx, dudoxx } from './dudoxx-provider';
export type {
  DudoxxProvider,
  DudoxxProviderSettings,
} from './dudoxx-provider';

export type {
  DudoxxChatModelId,
  DudoxxChatSettings,
} from './dudoxx-chat-settings';

export type {
  DudoxxEmbeddingModelId,
  DudoxxEmbeddingSettings,
} from './dudoxx-embedding-settings';

export type { DudoxxErrorData } from './dudoxx-error';

// Enhanced error handling and monitoring exports
export {
  DudoxxRateLimitError,
  DudoxxTimeoutError,
  DudoxxToolError,
  exponentialBackoff,
  withRetry,
  classifyError,
} from './dudoxx-error';

// Tool execution monitoring exports
export {
  DudoxxToolExecutionMonitor,
  globalToolMonitor,
} from './dudoxx-tool-execution-monitor';

export type {
  ToolExecutionMetrics,
  ToolExecutionConfig,
} from './dudoxx-tool-execution-monitor';

// Enhanced response metadata exports
export {
  getResponseMetadata,
  getStreamingMetadata,
} from './get-response-metadata';

export type { DudoxxResponseMetadata } from './get-response-metadata';

// Tools
export {
  weatherTool,
  aiSdkWeatherTool,
  getWeather,
  formatWeatherInfo,
  weatherToolSchema,
} from './tools/weather-tool';
export type {
  WeatherToolParams,
  WeatherInfo,
} from './tools/weather-tool';