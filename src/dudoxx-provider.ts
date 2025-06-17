import {
  EmbeddingModelV1,
  LanguageModelV1,
  ProviderV1,
} from '@ai-sdk/provider';
import {
  FetchFunction,
  loadApiKey,
  withoutTrailingSlash,
} from '@ai-sdk/provider-utils';
import { DudoxxChatLanguageModel } from './dudoxx-chat-language-model';
import {
  DudoxxChatModelId,
  DudoxxChatSettings,
} from './dudoxx-chat-settings';
import { DudoxxEmbeddingModel } from './dudoxx-embedding-model';
import {
  DudoxxEmbeddingModelId,
  DudoxxEmbeddingSettings,
} from './dudoxx-embedding-settings';

export interface DudoxxProvider extends ProviderV1 {
  (
    modelId: DudoxxChatModelId,
    settings?: DudoxxChatSettings,
  ): LanguageModelV1;

  /**
   * Creates a model for text generation.
   */
  languageModel(
    modelId: DudoxxChatModelId,
    settings?: DudoxxChatSettings,
  ): LanguageModelV1;

  /**
   * Creates a model for text generation.
   */
  chat(
    modelId: DudoxxChatModelId,
    settings?: DudoxxChatSettings,
  ): LanguageModelV1;

  /**
   * @deprecated Use `textEmbeddingModel()` instead.
   */
  embedding(
    modelId: DudoxxEmbeddingModelId,
    settings?: DudoxxEmbeddingSettings,
  ): EmbeddingModelV1<string>;

  /**
   * @deprecated Use `textEmbeddingModel()` instead.
   */
  textEmbedding(
    modelId: DudoxxEmbeddingModelId,
    settings?: DudoxxEmbeddingSettings,
  ): EmbeddingModelV1<string>;

  textEmbeddingModel: (
    modelId: DudoxxEmbeddingModelId,
    settings?: DudoxxEmbeddingSettings,
  ) => EmbeddingModelV1<string>;
}

export interface DudoxxProviderSettings {
  /**
   * Use a different URL prefix for API calls, e.g. to use proxy servers.
   * The default prefix is `https://llm-proxy.dudoxx.com/v1`.
   */
  baseURL?: string;

  /**
   * API key that is being sent using the `Authorization` header.
   * It defaults to the `DUDOXX_API_KEY` environment variable.
   */
  apiKey?: string;

  /**
   * Custom headers to include in the requests.
   */
  headers?: Record<string, string>;

  /**
   * Custom fetch implementation. You can use it as a middleware to intercept requests,
   * or to provide a custom fetch implementation for e.g. testing.
   */
  fetch?: FetchFunction;
}

/**
 * Create a DUDOXX AI provider instance.
 */
export function createDudoxx(
  options: DudoxxProviderSettings = {},
): DudoxxProvider {
  const baseURL =
    withoutTrailingSlash(options.baseURL) ??
    'https://llm-proxy.dudoxx.com/v1';

  const getHeaders = () => ({
    Authorization: `Bearer ${loadApiKey({
      apiKey: options.apiKey,
      environmentVariableName: 'DUDOXX_API_KEY',
      description: 'DUDOXX',
    })}`,
    'User-Agent': 'ai-sdk-dudoxx/0.1.0',
    ...options.headers,
  });

  const createChatModel = (
    modelId: DudoxxChatModelId,
    settings: DudoxxChatSettings = {},
  ) =>
    new DudoxxChatLanguageModel(modelId, settings, {
      provider: 'dudoxx.chat',
      baseURL,
      headers: getHeaders,
      fetch: options.fetch,
    });

  const createEmbeddingModel = (
    modelId: DudoxxEmbeddingModelId,
    settings: DudoxxEmbeddingSettings = {},
  ) =>
    new DudoxxEmbeddingModel(modelId, settings, {
      provider: 'dudoxx.embedding',
      baseURL,
      headers: getHeaders,
      fetch: options.fetch,
    });

  const provider = function (
    modelId: DudoxxChatModelId,
    settings?: DudoxxChatSettings,
  ) {
    if (new.target) {
      throw new Error(
        'The DUDOXX model function cannot be called with the new keyword.',
      );
    }

    return createChatModel(modelId, settings);
  };

  provider.languageModel = createChatModel;
  provider.chat = createChatModel;
  provider.embedding = createEmbeddingModel;
  provider.textEmbedding = createEmbeddingModel;
  provider.textEmbeddingModel = createEmbeddingModel;

  return provider;
}

/**
 * Default DUDOXX provider instance.
 */
export const dudoxx = createDudoxx();