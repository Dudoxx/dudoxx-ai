import { createTestServer } from '@ai-sdk/provider-utils/test';
import { createDudoxx } from './dudoxx-provider';

const provider = createDudoxx({
  apiKey: 'test-api-key',
  baseURL: 'https://llm-proxy.dudoxx.com/v1',
});
const model = provider.textEmbeddingModel('embedder');

const server = createTestServer({
  'https://llm-proxy.dudoxx.com/v1/embeddings': {},
});

describe('doEmbed', () => {
  function prepareJsonResponse({
    embeddings = [[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]],
    usage = { prompt_tokens: 10, total_tokens: 10 },
    headers,
  }: {
    embeddings?: number[][];
    usage?: { prompt_tokens: number; total_tokens: number };
    headers?: Record<string, string>;
  }) {
    server.urls['https://llm-proxy.dudoxx.com/v1/embeddings'].response = {
      type: 'json-value',
      headers,
      body: {
        object: 'list',
        data: embeddings.map((embedding, index) => ({
          object: 'embedding',
          embedding,
          index,
        })),
        model: 'embedder',
        usage,
      },
    };
  }

  it('should extract embeddings', async () => {
    prepareJsonResponse({
      embeddings: [[0.1, 0.2, 0.3], [0.4, 0.5, 0.6]],
    });

    const { embeddings } = await model.doEmbed({
      values: ['first text', 'second text'],
    });

    expect(embeddings).toStrictEqual([
      [0.1, 0.2, 0.3],
      [0.4, 0.5, 0.6],
    ]);
  });

  it('should extract usage', async () => {
    prepareJsonResponse({
      usage: { prompt_tokens: 20, total_tokens: 20 },
    });

    const { usage } = await model.doEmbed({
      values: ['first text', 'second text'],
    });

    expect(usage).toStrictEqual({ tokens: 20 });
  });

  it('should pass through the model id', async () => {
    prepareJsonResponse({});

    await model.doEmbed({
      values: ['text'],
    });

    const request = server.urls[
      'https://llm-proxy.dudoxx.com/v1/embeddings'
    ].getRequestBodyJson();

    expect(request).toMatchObject({
      model: 'embedder',
    });
  });

  it('should pass through custom settings', async () => {
    const customModel = provider.textEmbeddingModel('embedder', {
      dimensions: 512,
      encodingFormat: 'base64',
    });

    prepareJsonResponse({});

    await customModel.doEmbed({
      values: ['text'],
    });

    const request = server.urls[
      'https://llm-proxy.dudoxx.com/v1/embeddings'
    ].getRequestBodyJson();

    expect(request).toMatchObject({
      model: 'embedder',
      dimensions: 512,
      encoding_format: 'base64',
    });
  });

  it('should pass through DUDOXX-specific parameters', async () => {
    const customModel = provider.textEmbeddingModel('embedder', {
      dudoxxParams: {
        preprocessing: { normalize: true },
        modelConfig: { batch_size: 16 },
      },
    });

    prepareJsonResponse({});

    await customModel.doEmbed({
      values: ['text'],
    });

    const request = server.urls[
      'https://llm-proxy.dudoxx.com/v1/embeddings'
    ].getRequestBodyJson();

    expect(request).toMatchObject({
      model: 'embedder',
      preprocessing: { normalize: true },
      modelConfig: { batch_size: 16 },
    });
  });

  it('should handle max embeddings per call', async () => {
    const limitedModel = provider.textEmbeddingModel('embedder', {
      maxEmbeddingsPerCall: 2,
    });

    expect(limitedModel.maxEmbeddingsPerCall).toBe(2);

    await expect(
      limitedModel.doEmbed({
        values: ['text1', 'text2', 'text3'],
      }),
    ).rejects.toThrow('Too many embedding values for call');
  });

  it('should support parallel calls', () => {
    const parallelModel = provider.textEmbeddingModel('embedder', {
      supportsParallelCalls: true,
    });

    expect(parallelModel.supportsParallelCalls).toBe(true);
  });
});