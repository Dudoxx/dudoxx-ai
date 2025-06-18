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