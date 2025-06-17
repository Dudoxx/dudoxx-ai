import {
  EmbeddingModelV1,
  TooManyEmbeddingValuesForCallError,
} from '@ai-sdk/provider';
import {
  combineHeaders,
  createJsonResponseHandler,
  FetchFunction,
  postJsonToApi,
} from '@ai-sdk/provider-utils';
import { z } from 'zod';
import {
  DudoxxEmbeddingModelId,
  DudoxxEmbeddingSettings,
} from './dudoxx-embedding-settings';
import { dudoxxFailedResponseHandler } from './dudoxx-error';

type DudoxxEmbeddingConfig = {
  provider: string;
  baseURL: string;
  headers: () => Record<string, string | undefined>;
  fetch?: FetchFunction;
};

export class DudoxxEmbeddingModel implements EmbeddingModelV1<string> {
  readonly specificationVersion = 'v1';
  readonly modelId: DudoxxEmbeddingModelId;

  private readonly config: DudoxxEmbeddingConfig;
  private readonly settings: DudoxxEmbeddingSettings;

  get provider(): string {
    return this.config.provider;
  }

  get maxEmbeddingsPerCall(): number {
    return this.settings.maxEmbeddingsPerCall ?? 32;
  }

  get supportsParallelCalls(): boolean {
    // DUDOXX supports parallel calls efficiently
    return this.settings.supportsParallelCalls ?? true;
  }

  constructor(
    modelId: DudoxxEmbeddingModelId,
    settings: DudoxxEmbeddingSettings,
    config: DudoxxEmbeddingConfig,
  ) {
    this.modelId = modelId;
    this.settings = settings;
    this.config = config;
  }

  async doEmbed({
    values,
    abortSignal,
    headers,
  }: Parameters<EmbeddingModelV1<string>['doEmbed']>[0]): Promise<
    Awaited<ReturnType<EmbeddingModelV1<string>['doEmbed']>>
  > {
    if (values.length > this.maxEmbeddingsPerCall) {
      throw new TooManyEmbeddingValuesForCallError({
        provider: this.provider,
        modelId: this.modelId,
        maxEmbeddingsPerCall: this.maxEmbeddingsPerCall,
        values,
      });
    }

    const body: Record<string, unknown> = {
      model: this.modelId,
      input: values,
      encoding_format: this.settings.encodingFormat ?? 'float',
    };

    // Add optional dimensions parameter
    if (this.settings.dimensions != null) {
      body.dimensions = this.settings.dimensions;
    }

    // Add DUDOXX-specific parameters
    if (this.settings.dudoxxParams) {
      Object.assign(body, this.settings.dudoxxParams);
    }

    const { responseHeaders, value: response } = await postJsonToApi({
      url: `${this.config.baseURL}/embeddings`,
      headers: combineHeaders(this.config.headers(), headers),
      body,
      failedResponseHandler: dudoxxFailedResponseHandler,
      successfulResponseHandler: createJsonResponseHandler(
        DudoxxEmbeddingResponseSchema,
      ),
      abortSignal,
      fetch: this.config.fetch,
    });

    return {
      embeddings: response.data.map(item => item.embedding),
      usage: response.usage
        ? { tokens: response.usage.prompt_tokens }
        : undefined,
      rawResponse: { headers: responseHeaders },
    };
  }
}

// DUDOXX Embedding Response Schema (OpenAI-compatible)
const DudoxxEmbeddingResponseSchema = z.object({
  object: z.literal('list'),
  data: z.array(
    z.object({
      object: z.literal('embedding'),
      embedding: z.array(z.number()),
      index: z.number(),
    }),
  ),
  model: z.string(),
  usage: z
    .object({
      prompt_tokens: z.number(),
      total_tokens: z.number(),
    })
    .nullish(),
});