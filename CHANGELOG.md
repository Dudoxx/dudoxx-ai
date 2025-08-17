# @ai-sdk/dudoxx

## 1.3.1

### 🔐 Security & Configuration Fixes

- **BREAKING**: Removed hardcoded API endpoints - `DUDOXX_BASE_URL` environment variable now required
- **BREAKING**: Updated default endpoint from `llm-proxy.dudoxx.com` to `llm-router.dudoxx.com`
- **Enhanced**: Strict environment variable validation with clear error messages
- **Added**: Configuration utility functions for required environment variables
- **Fixed**: Provider initialization hanging issues when environment variables are missing

### 🛠️ New Configuration Utilities

- `getRequiredChatModel()` - Validates and returns `DUDOXX_MODEL_NAME` from environment
- `getRequiredReasoningModel()` - Validates and returns `DUDOXX_REASONING_MODEL_NAME` from environment  
- `getRequiredEmbeddingModel()` - Validates and returns `DUDOXX_EMBEDDING_MODEL_NAME` from environment
- `getRequiredBaseURL()` - Validates and returns `DUDOXX_BASE_URL` from environment
- `validateDudoxxEnvironment()` - Validates all required DUDOXX environment variables

### 📋 Required Environment Variables

All applications must now set these environment variables:

```bash
DUDOXX_API_KEY=your_api_key_here
DUDOXX_BASE_URL=https://llm-router.dudoxx.com/v1
DUDOXX_MODEL_NAME=dudoxx
DUDOXX_REASONING_MODEL_NAME=dudoxx-reasoning
DUDOXX_EMBEDDING_MODEL_NAME=embedder
```

### 🔧 Migration Guide

**Update your .env file:**
```bash
# Change from old endpoint
DUDOXX_BASE_URL=https://llm-router.dudoxx.com/v1

# Add required model names
DUDOXX_MODEL_NAME=dudoxx
DUDOXX_REASONING_MODEL_NAME=dudoxx-reasoning
DUDOXX_EMBEDDING_MODEL_NAME=embedder
```

**Use new strict pattern (recommended):**
```typescript
import { dudoxx, getRequiredChatModel, validateDudoxxEnvironment } from 'dudoxx-ai';

// Validate environment on startup  
validateDudoxxEnvironment();

// Use environment-based model selection
const result = await generateText({
  model: dudoxx(getRequiredChatModel()),
  messages: [{ role: 'user', content: 'Hello!' }],
});
```

### 📚 Documentation

- Added `ENVIRONMENT_VARIABLE_REQUIREMENTS.md` with comprehensive migration guide
- Updated examples to demonstrate strict environment variable patterns
- Enhanced error messages with exact .env syntax needed

### 🐛 Bug Fixes

- Fixed provider hanging when connecting to outdated `llm-proxy.dudoxx.com` endpoint
- Fixed TypeScript type errors in provider configuration
- Fixed examples timing out due to hardcoded API endpoints
- Fixed lazy evaluation of environment variables to prevent import-time errors

## 1.3.0

### New Features

- **Mock Weather Tool**: Added comprehensive weather tool for demonstration and testing
- **Tool Examples**: Complete usage examples with .env.local configuration
- **Standalone Weather API**: Direct weather tool usage without AI SDK integration
- **Temperature Conversion**: Support for both Celsius and Fahrenheit units
- **Mock Data Coverage**: Pre-configured data for 8 major cities with fallback for unknown locations
- **Error Handling**: Robust error handling and graceful degradation
- **TypeScript Support**: Full type definitions for weather tool interfaces

### Tool Features

- **City Support**: New York, London, Tokyo, Paris, Sydney, Berlin, Toronto, Dubai
- **Weather Data**: Temperature, condition, humidity, wind speed, and detailed descriptions
- **Random Generation**: Realistic weather data for unlisted cities
- **API Simulation**: Simulated API delays for realistic testing
- **Format Utilities**: Pretty-printed weather information formatting

### Usage Examples

- `examples/simple-weather-example.ts`: Basic weather tool usage
- `examples/weather-tool-demo.ts`: Comprehensive demonstration with streaming
- `examples/test-weather-standalone.ts`: Direct tool testing
- `examples/test-ai-integration.ts`: AI SDK integration testing

### Tests

- **Comprehensive Test Suite**: 21 test cases covering all weather tool functionality
- **Parameter Validation**: Zod schema validation testing
- **Error Scenarios**: Error handling and fallback testing
- **City Coverage**: Tests for all pre-configured cities
- **Integration Tests**: AI SDK tool integration validation

## 1.1.0

### Major Improvements

- **Enhanced Tool Calls Handling**: Comprehensive improvements for Mistral LLM compatibility
- **Robust ID Generation**: Automatic tool call ID generation for missing IDs in DUDOXX streaming
- **Streaming Validation**: Added validation for malformed tool calls in streaming responses
- **Error Handling**: Enhanced error recovery with detailed logging and fallback mechanisms
- **Schema Validation**: Improved tool definition validation with descriptive error messages
- **JSON Parsing**: Multiple extraction strategies for robust tool call parsing
- **Execution Timeout**: 30-second timeout protection for tool execution
- **Parameter Validation**: Enhanced type checking and structure validation
- **Debugging**: Comprehensive error logging and execution timing information
- **Compatibility**: Better Vercel AI SDK integration and improved streaming stability

### Bug Fixes

- Fixed missing tool call IDs causing validation errors
- Resolved malformed response handling in streaming mode
- Enhanced tool execution error recovery
- Improved JSON argument validation
- Added fallback mechanisms for corrupted tool calls

### Performance

- Added execution timeouts to prevent hanging tools
- Optimized tool call processing with early validation
- Improved error handling reduces debugging overhead

## 1.0.0

### Major Changes

- **Initial Release**: First version of the DUDOXX AI SDK provider
- **Chat Models**: Support for `dudoxx` and `dudoxx-reasoning` models
- **Embedding Models**: Support for `embedder` model
- **Tool Calling**: Full function calling and tool usage support
- **Streaming**: Real-time streaming of chat completions
- **OpenAI Compatibility**: Uses OpenAI-compatible API format
- **Custom Parameters**: Support for DUDOXX-specific parameters
  - Reasoning effort levels for reasoning models
  - Custom DUDOXX parameters for fine-tuned control
- **Comprehensive Testing**: Full test suite covering all functionality
- **TypeScript Support**: Complete type definitions for all features