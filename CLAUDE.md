# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DUDOXX-AI is an enterprise-grade AI SDK provider package that integrates DUDOXX language models with the Vercel AI SDK. It provides OpenAI-compatible API integration for DUDOXX's advanced reasoning capabilities following the standard AI SDK provider pattern.

## Core Technology Stack

- **TypeScript** with strict mode for type safety
- **Vercel AI SDK** (`@ai-sdk/provider`, `@ai-sdk/provider-utils`) for standardized AI integration
- **Zod** for runtime schema validation and type safety
- **TSUP** for modern TypeScript bundling (ESM/CJS dual package)
- **Vitest** for testing in both Node.js and Edge runtime environments

## Essential Development Commands

### Build and Development
```bash
npm run build              # Build for production (ESM + CJS)
npm run build:watch        # Build in watch mode for development
npm run clean              # Clean dist directory
npm run type-check         # TypeScript type checking
npm run lint               # ESLint validation
npm run prettier-check     # Code formatting validation
```

### Testing
```bash
npm test                   # Run all tests (Node + Edge environments)
npm run test:node          # Run Node.js environment tests
npm run test:edge          # Run Edge runtime tests
npm run test:node:watch    # Run Node tests in watch mode
```

### Demos and Examples
```bash
npm run demo:generate              # Basic text generation demo
npm run demo:streaming             # Streaming response demo
npm run demo:embed                 # Text embedding demo
npm run example:ai-integration     # Complete tool integration with formatted response
npm run example:working-streaming  # Working demonstration of tools + streaming workflow
npm run example:simple-streaming   # Simple text streaming example
npm run example:streaming-tools    # Advanced streaming with detailed debugging
```

## Core Architecture

### Provider Implementation Pattern
The package follows the Vercel AI SDK provider interface:

```typescript
export interface DudoxxProvider extends ProviderV1 {
  (modelId: DudoxxChatModelId, settings?: DudoxxChatSettings): LanguageModelV1;
  languageModel(modelId: DudoxxChatModelId, settings?: DudoxxChatSettings): LanguageModelV1;
  chat(modelId: DudoxxChatModelId, settings?: DudoxxChatSettings): LanguageModelV1;
  textEmbeddingModel(modelId: DudoxxEmbeddingModelId, settings?: DudoxxEmbeddingSettings): EmbeddingModelV1<string>;
}
```

### Key Models
- **`dudoxx`** - Standard DUDOXX chat model
- **`dudoxx-reasoning`** - Enhanced reasoning model with step-by-step thinking
- **`embedder`** - DUDOXX embedding model for text embeddings

### File Structure
```
src/
├── index.ts                              # Main exports and public API
├── dudoxx-provider.ts                   # Provider factory and configuration
├── dudoxx-chat-language-model.ts        # Chat model implementation
├── dudoxx-embedding-model.ts            # Embedding model implementation
├── dudoxx-chat-settings.ts              # Chat model configuration types
├── dudoxx-embedding-settings.ts         # Embedding configuration types
├── dudoxx-prepare-tools.ts              # Tool preparation and validation
├── convert-to-dudoxx-chat-messages.ts   # Message format conversion
├── get-response-metadata.ts             # Response metadata extraction
├── map-dudoxx-finish-reason.ts          # Finish reason mapping
├── dudoxx-error.ts                      # Error handling utilities
└── tools/                               # Built-in tools
    ├── weather-tool.ts                  # Mock weather tool implementation
    └── weather-tool.test.ts             # Weather tool tests
```

## Environment Configuration

### Required Environment Variables
```bash
DUDOXX_API_KEY=your_api_key_here                    # Required
DUDOXX_BASE_URL=https://llm-proxy.dudoxx.com/v1     # Optional (default)
DUDOXX_MODEL_NAME=dudoxx                            # Optional (default)
DUDOXX_REASONING_MODEL_NAME=dudoxx-reasoning        # Optional (default)
DUDOXX_EMBEDDING_MODEL_NAME=embedder               # Optional (default)
```

### Configuration Files
- **tsconfig.json** - Strict TypeScript configuration with ES2020 target
- **tsup.config.ts** - Dual ESM/CJS build configuration with type declarations
- **vitest.config.ts** - Test configuration for Node.js and Edge environments
- **package.json** - Dual package export configuration (`"type": "module"`)

## Key Features and Capabilities

### Tool Integration
- **Function calling** with comprehensive Zod schema validation
- **Built-in weather tool** for demonstrations and testing
- **Automatic ID generation** for missing tool call IDs in streaming responses
- **Multiple parsing strategies** for robust tool extraction from malformed responses
- **30-second timeout protection** for tool calls

### Streaming Support
- **Real-time text streaming** with proper chunk handling
- **Tool call streaming** with validation and error recovery
- **Response metadata streaming** for usage tracking
- **Enhanced error recovery** for malformed streaming responses

### Error Handling
- **Comprehensive error types** (`DudoxxErrorData`)
- **Fallback mechanisms** for API failures
- **Detailed logging** for debugging and monitoring
- **Graceful degradation** for partial failures

## Development Patterns

### Testing Strategy
- **Unit tests** for all core components in `src/`
- **Integration tests** for AI SDK compatibility in `examples/`
- **Edge runtime testing** for deployment compatibility
- **Mock tool testing** with comprehensive scenarios

### Build Process
- **Dual package output** - ESM (`.mjs`) and CommonJS (`.js`)
- **Type declarations** (`.d.ts`) for TypeScript consumers
- **Source maps** enabled for debugging
- **External dependencies** (Zod) marked as peer dependencies

### Code Quality
- **Strict TypeScript** with comprehensive type definitions
- **ESLint** validation with TypeScript-specific rules
- **Prettier** code formatting with consistent style
- **Comprehensive validation** at all integration points

## DUDOXX-Specific Features

### Enhanced Reasoning
- **Step-by-step thinking** capabilities with `dudoxx-reasoning` model
- **Custom DUDOXX parameters** for fine-tuned control
- **Advanced prompt engineering** support

### Enterprise Integration
- **DUDOXX proxy integration** with enterprise endpoints
- **Production-ready configuration** with fallback mechanisms
- **Usage tracking** and metadata collection
- **OpenAI-compatible API** communication

## Important Development Notes

### Tool Call Enhancements
Recent improvements include automatic handling of missing tool call IDs, which is crucial for streaming responses. The system now:
- Generates UUIDs for missing tool call IDs
- Validates JSON structure of tool arguments
- Implements multiple parsing strategies for robustness
- Provides comprehensive error logging

### Streaming and Tools Usage Patterns
The AI SDK with DUDOXX provider follows these patterns:

**For Tool Calls with Final Response:**
```typescript
// Use generateText with maxSteps for complete tool workflow
const result = await generateText({
  model: dudoxx('dudoxx'),
  tools: { get_weather: weatherTool },
  maxSteps: 5, // Allows tool calls + final response
  messages: [...]
});
// Result includes: toolCalls, toolResults, steps, and final text
```

**For Streaming Text Responses:**
```typescript
// Use streamText for real-time text streaming
const result = await streamText({
  model: dudoxx('dudoxx'),
  messages: [...]
});

for await (const textPart of result.textStream) {
  process.stdout.write(textPart);
}
```

**Combined Workflow:**
1. Use `generateText` with tools for data gathering and structured responses
2. Use `streamText` for follow-up questions or detailed explanations
3. Both approaches work seamlessly with the DUDOXX provider

**Important Note: Token Usage in Streaming Mode**
The DUDOXX API currently does not provide token usage data in streaming responses. This means:
- `streamText()` will return 0 for all token counts (promptTokens, completionTokens, totalTokens)
- `generateText()` provides accurate token usage information
- If you need precise token counts, use `generateText()` instead of `streamText()`
- This is a limitation of the DUDOXX streaming API, not the provider implementation

### Testing Requirements
Always run both Node.js and Edge runtime tests when making changes:
- Node.js tests validate core functionality
- Edge tests ensure deployment compatibility (Vercel, Cloudflare, etc.)

### Package Distribution
The package is built as a dual ESM/CJS module with proper TypeScript declarations. Ensure all exports in `src/index.ts` are properly typed and documented.