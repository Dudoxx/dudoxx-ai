# Environment Variable Requirements - DUDOXX AI Provider

## Summary of Changes

The DUDOXX AI provider now strictly enforces environment variable requirements and eliminates all hardcoded API endpoints and model names.

## Required Environment Variables

All DUDOXX applications **must** set these environment variables:

```bash
# Required API Configuration
DUDOXX_API_KEY=your_api_key_here
DUDOXX_BASE_URL=https://llm-router.dudoxx.com/v1

# Required Model Names
DUDOXX_MODEL_NAME=dudoxx
DUDOXX_REASONING_MODEL_NAME=dudoxx-reasoning  
DUDOXX_EMBEDDING_MODEL_NAME=embedder
```

## Changes Made

### 1. Provider Configuration (`src/dudoxx-provider.ts`)

**Before:**
```typescript
const baseURL = withoutTrailingSlash(options.baseURL) ?? 'https://llm-proxy.dudoxx.com/v1';
```

**After:**
```typescript
const getBaseURL = (): string => {
  const envBaseURL = process.env.DUDOXX_BASE_URL;
  if (!options.baseURL && !envBaseURL) {
    throw new Error(
      'DUDOXX_BASE_URL environment variable is required. Please set it in your .env file (e.g., DUDOXX_BASE_URL=https://llm-router.dudoxx.com/v1)'
    );
  }
  const baseURL = options.baseURL ?? envBaseURL!;
  return withoutTrailingSlash(baseURL) ?? baseURL;
};
```

### 2. New Configuration Utilities (`src/dudoxx-config-utils.ts`)

Added utility functions to enforce environment variable requirements:

```typescript
// Get required model names from environment
export function getRequiredChatModel(envVarName = 'DUDOXX_MODEL_NAME'): DudoxxChatModelId
export function getRequiredReasoningModel(envVarName = 'DUDOXX_REASONING_MODEL_NAME'): DudoxxChatModelId  
export function getRequiredEmbeddingModel(envVarName = 'DUDOXX_EMBEDDING_MODEL_NAME'): DudoxxEmbeddingModelId
export function getRequiredBaseURL(envVarName = 'DUDOXX_BASE_URL'): string

// Validate all required variables at once
export function validateDudoxxEnvironment(): void
```

### 3. Updated Examples

**Before:**
```typescript
const result = await generateText({
  model: dudoxx(process.env.DUDOXX_MODEL_NAME || 'dudoxx', {
    temperature: 0.7,
  }),
  // ...
});
```

**After:**
```typescript
// Validate all required environment variables first
validateDudoxxEnvironment();

const result = await generateText({
  model: dudoxx(getRequiredChatModel(), {
    temperature: 0.7,
  }),
  // ...
});
```

## Error Messages

### Missing Environment Variables
When environment variables are missing, users get clear error messages:

```
Error: Missing required DUDOXX environment variables: DUDOXX_BASE_URL, DUDOXX_MODEL_NAME
Please set them in your .env file:
  DUDOXX_API_KEY=your_api_key
  DUDOXX_BASE_URL=https://llm-router.dudoxx.com/v1
  DUDOXX_MODEL_NAME=dudoxx
  DUDOXX_REASONING_MODEL_NAME=dudoxx-reasoning
  DUDOXX_EMBEDDING_MODEL_NAME=embedder
```

### Missing Individual Model Variables
```
Error: DUDOXX_MODEL_NAME environment variable is required. 
Please set it in your .env file (e.g., DUDOXX_MODEL_NAME=dudoxx)
```

## Migration Guide

### For Existing Applications

1. **Update your .env file** to include all required variables:
   ```bash
   DUDOXX_BASE_URL=https://llm-router.dudoxx.com/v1  # Changed from llm-proxy
   DUDOXX_MODEL_NAME=dudoxx
   DUDOXX_REASONING_MODEL_NAME=dudoxx-reasoning
   DUDOXX_EMBEDDING_MODEL_NAME=embedder
   ```

2. **Replace hardcoded model usage** (optional but recommended):
   ```typescript
   // Old approach (still works)
   dudoxx(process.env.DUDOXX_MODEL_NAME || 'dudoxx')
   
   // New strict approach  
   dudoxx(getRequiredChatModel())
   ```

3. **Add environment validation** (recommended):
   ```typescript
   import { validateDudoxxEnvironment } from 'dudoxx-ai';
   
   // Validate early in your application
   validateDudoxxEnvironment();
   ```

### For New Applications

Use the strict pattern from the start:

```typescript
import { dudoxx, getRequiredChatModel, validateDudoxxEnvironment } from 'dudoxx-ai';
import { generateText } from 'ai';

// Validate environment on startup
validateDudoxxEnvironment();

// Use environment-based model selection
const result = await generateText({
  model: dudoxx(getRequiredChatModel()),
  messages: [{ role: 'user', content: 'Hello!' }],
});
```

## Benefits

1. **Security**: No hardcoded API endpoints in code
2. **Flexibility**: Easy to switch between environments (dev/staging/prod)
3. **Error Prevention**: Clear error messages when configuration is missing
4. **Future-Proof**: Updates to API endpoints only require env var changes
5. **Best Practices**: Follows 12-factor app methodology

## Breaking Changes

- **Removed hardcoded fallback** to `https://llm-proxy.dudoxx.com/v1`
- **Environment variables now required** - applications will error if not set
- **Updated default endpoint** to `https://llm-router.dudoxx.com/v1`

## Backwards Compatibility

- Existing code using `process.env.DUDOXX_MODEL_NAME || 'fallback'` still works
- Provider interface remains unchanged
- All existing examples and demos continue to function