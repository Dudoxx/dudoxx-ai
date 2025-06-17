# DUDOXX AI Provider - Local Usage Guide

This is the local DUDOXX AI provider implementation for the dudoxx-demo project. It provides a complete AI SDK provider following the same patterns as official providers like Mistral and OpenAI.

## Installation & Setup

The provider is already included as a local dependency in the main project. To use it:

1. **Build the provider** (optional, for development):
   ```bash
   cd dudoxx-ai
   npm run build
   ```

2. **Use in your code**:
   ```typescript
   // Option 1: Use the clean provider import
   import { dudoxx, createDudoxx } from 'dudoxx-ai-provider';
   
   // Option 2: Use the convenience wrapper (recommended for demos)
   import { dudoxxChat, dudoxxReasoning } from '../lib/dudoxx-ai-provider';
   ```

## Basic Usage Examples

### Text Generation
```typescript
import { generateText } from 'ai';
import { dudoxx } from 'dudoxx-ai-provider';

const { text } = await generateText({
  model: dudoxx('dudoxx'),
  prompt: 'Explain quantum computing in simple terms',
});
```

### Reasoning Model
```typescript
import { dudoxx } from 'dudoxx-ai-provider';

const model = dudoxx('dudoxx-reasoning', {
  reasoningEffort: 'high',
  temperature: 0.7,
});

const { text } = await generateText({
  model,
  prompt: 'Solve this step by step: What is 15% of 250?',
});
```

### Tool Calling
```typescript
import { generateText } from 'ai';
import { dudoxx } from 'dudoxx-ai-provider';
import { z } from 'zod';

const { text } = await generateText({
  model: dudoxx('dudoxx'),
  prompt: 'What is the weather like in London?',
  tools: {
    getWeather: {
      description: 'Get current weather for a city',
      parameters: z.object({
        city: z.string().describe('The city name'),
      }),
      execute: async ({ city }) => {
        // Your weather API implementation
        return { temperature: 15, condition: 'cloudy' };
      },
    },
  },
});
```

### Embeddings
```typescript
import { embed } from 'ai';
import { dudoxx } from 'dudoxx-ai-provider';

const { embedding } = await embed({
  model: dudoxx.textEmbeddingModel('embedder'),
  value: 'Text to embed',
});
```

### Streaming
```typescript
import { streamText } from 'ai';
import { dudoxx } from 'dudoxx-ai-provider';

const { textStream } = await streamText({
  model: dudoxx('dudoxx'),
  prompt: 'Write a story about AI',
});

for await (const delta of textStream) {
  process.stdout.write(delta);
}
```

## Environment Variables

Make sure these are set in your `.env.local`:

```bash
DUDOXX_API_KEY=your_api_key_here
DUDOXX_BASE_URL=https://llm-proxy.dudoxx.com/v1
DUDOXX_MODEL_NAME=dudoxx
DUDOXX_REASONING_MODEL_NAME=dudoxx-reasoning
DUDOXX_EMBEDDING_MODEL_NAME=embedder
DUDOXX_TEMPERATURE=0.7
DUDOXX_REASONING_EFFORT=medium
```

## Provider Features

✅ **Chat Models**: `dudoxx`, `dudoxx-reasoning`  
✅ **Embedding Models**: `embedder`  
✅ **Tool Calling**: Full function calling support  
✅ **Streaming**: Real-time text streaming  
✅ **Custom Parameters**: Reasoning effort, DUDOXX-specific options  
✅ **Error Handling**: Comprehensive error handling  
✅ **Type Safety**: Full TypeScript support  

## Architecture

The provider follows the official AI SDK provider pattern:

- **Provider**: Main entry point (`dudoxx`, `createDudoxx`)
- **Models**: Chat and embedding model implementations
- **Settings**: Typed configuration options
- **Utilities**: Message conversion, error handling, response mapping
- **Tests**: Comprehensive test suite

## Development

To develop the provider:

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build

# Type check
npm run type-check

# Lint
npm run lint
```

## Migration from Old Provider

If you're using the old implementation in `dudoxx-provider.ts`, consider migrating to the new clean provider:

```typescript
// Old way
import { dudoxxChat } from '../lib/dudoxx-provider';

// New way (cleaner)
import { dudoxxChat } from '../lib/dudoxx-ai-provider';
// or
import { dudoxx } from 'dudoxx-ai-provider';
const model = dudoxx('dudoxx');
```

Both approaches work, but the new provider offers better TypeScript support and follows official AI SDK patterns.