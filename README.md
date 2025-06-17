# dudoxx-ai - DUDOXX AI SDK Provider

Enterprise-grade AI SDK provider for DUDOXX language models with advanced reasoning capabilities and comprehensive tool support.

## Features

- **🧠 Advanced Reasoning**: Support for `dudoxx` and `dudoxx-reasoning` models with enhanced cognitive capabilities
- **🔧 Tool Integration**: Full support for function calling and tool orchestration
- **⚡ Real-time Streaming**: High-performance streaming of chat completions
- **🎯 Enterprise Ready**: Production-grade reliability with comprehensive error handling
- **🔌 OpenAI Compatible**: Seamless integration using OpenAI-compatible API format
- **📊 Embedding Models**: Support for the `embedder` model with customizable dimensions
- **🛡️ Type Safety**: Complete TypeScript support with comprehensive type definitions

## Installation

```bash
npm install dudoxx-ai
```

## Setup

1. Get your DUDOXX API key from your DUDOXX provider
2. Set the `DUDOXX_API_KEY` environment variable or pass it explicitly

```bash
export DUDOXX_API_KEY="your-api-key"
export DUDOXX_BASE_URL="https://llm-proxy.dudoxx.com/v1"  # Optional, this is the default
```

## Basic Usage

### Text Generation

```typescript
import { dudoxx } from 'dudoxx-ai';
import { generateText } from 'ai';

const { text } = await generateText({
  model: dudoxx('dudoxx'),
  prompt: 'Write a haiku about programming',
});

console.log(text);
```

### Streaming

```typescript
import { dudoxx } from 'dudoxx-ai';
import { streamText } from 'ai';

const { textStream } = await streamText({
  model: dudoxx('dudoxx'),
  prompt: 'Tell me a story about AI',
});

for await (const delta of textStream) {
  process.stdout.write(delta);
}
```

### Tool Calling

```typescript
import { dudoxx } from 'dudoxx-ai';
import { generateText } from 'ai';
import { z } from 'zod';

const { text } = await generateText({
  model: dudoxx('dudoxx'),
  prompt: 'What is the weather like in San Francisco?',
  tools: {
    getWeather: {
      description: 'Get the current weather in a city',
      parameters: z.object({
        city: z.string().describe('The city to get weather for'),
      }),
      execute: async ({ city }) => {
        // Your weather API call here
        return { temperature: 22, condition: 'sunny' };
      },
    },
  },
});
```

### Embeddings

```typescript
import { dudoxx } from 'dudoxx-ai';
import { embed } from 'ai';

const { embedding } = await embed({
  model: dudoxx.textEmbeddingModel('embedder'),
  value: 'This is a sample text to embed',
});

console.log(embedding);
```

## Models

### Chat Models

- `dudoxx` - Standard DUDOXX chat model
- `dudoxx-reasoning` - Enhanced reasoning model with step-by-step thinking

### Embedding Models

- `embedder` - DUDOXX embedding model for text embeddings

## Configuration

### Provider Settings

```typescript
import { createDudoxx } from 'dudoxx-ai';

const dudoxx = createDudoxx({
  apiKey: 'your-api-key', // defaults to DUDOXX_API_KEY env variable
  baseURL: 'https://llm-proxy.dudoxx.com/v1', // defaults to DUDOXX_BASE_URL env variable
  headers: {
    'Custom-Header': 'value',
  },
});
```

### Model-Specific Settings

#### Chat Settings

```typescript
const model = dudoxx('dudoxx-reasoning', {
  temperature: 0.7,
  topP: 0.9,
  frequencyPenalty: 0.1,
  presencePenalty: 0.1,
  reasoningEffort: 'high', // 'low' | 'medium' | 'high' for reasoning models
  dudoxxParams: {
    enableReasoning: true,
    reasoningParams: {
      maxSteps: 10,
    },
  },
});
```

#### Embedding Settings

```typescript
const embedder = dudoxx.textEmbeddingModel('embedder', {
  dimensions: 512,
  encodingFormat: 'float',
  maxEmbeddingsPerCall: 32,
  supportsParallelCalls: true,
  dudoxxParams: {
    preprocessing: {
      normalize: true,
    },
  },
});
```

## Advanced Usage

### Custom Base URL

```typescript
const customDudoxx = createDudoxx({
  baseURL: 'https://your-custom-dudoxx-endpoint.com/v1',
  apiKey: 'your-api-key',
});
```

### Error Handling

```typescript
import { dudoxx } from 'dudoxx-ai';
import { generateText } from 'ai';

try {
  const { text } = await generateText({
    model: dudoxx('dudoxx'),
    prompt: 'Hello',
  });
} catch (error) {
  if (error.name === 'AI_APICallError') {
    console.error('API Error:', error.message);
    console.error('Status:', error.statusCode);
  }
}
```

## Environment Variables

- `DUDOXX_API_KEY`: Your DUDOXX API key (required)
- `DUDOXX_BASE_URL`: Base URL for the DUDOXX API (optional, defaults to `https://llm-proxy.dudoxx.com/v1`)
- `DUDOXX_MODEL_NAME`: Default model name (optional, defaults to `dudoxx`)
- `DUDOXX_REASONING_MODEL_NAME`: Default reasoning model name (optional, defaults to `dudoxx-reasoning`)
- `DUDOXX_EMBEDDING_MODEL_NAME`: Default embedding model name (optional, defaults to `embedder`)

## TypeScript Support

This package is written in TypeScript and includes comprehensive type definitions. All model settings, responses, and configurations are fully typed.

## Examples

Check out the [AI SDK Examples](https://github.com/vercel/ai/tree/main/examples) repository for more usage examples with DUDOXX models.

## Support

For questions about the AI SDK, visit the [Vercel AI SDK Documentation](https://ai-sdk.dev).

For DUDOXX-specific questions, contact your DUDOXX provider support team.