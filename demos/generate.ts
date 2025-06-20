#!/usr/bin/env tsx

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { generateText } from 'ai';
import { 
  createDudoxx, 
  globalToolMonitor, 
  withRetry, 
  classifyError,
  DudoxxRateLimitError,
  DudoxxTimeoutError 
} from '../src/index';

/**
 * Demo: Basic text generation with DUDOXX models
 */
async function generateDemo() {
  console.log('🚀 DUDOXX Generate Demo with Enhanced Features\n');

  // Configure enhanced monitoring
  globalToolMonitor.updateConfig({
    timeoutMs: 30000,
    maxRetries: 3,
    enableMetrics: true,
    enablePerformanceTracking: true,
  });

  console.log('📊 Enhanced Features Enabled:');
  console.log('- Global tool execution monitoring');
  console.log('- Automatic retry with exponential backoff');
  console.log('- Comprehensive error handling and classification');
  console.log('- Performance tracking and analytics\n');

  // Initialize DUDOXX provider
  const dudoxx = createDudoxx({
    baseURL: process.env.DUDOXX_BASE_URL,
    apiKey: process.env.DUDOXX_API_KEY,
  });

  try {
    // 1. Standard model generation
    console.log('1. Standard Model Generation');
    console.log('='.repeat(40));
    
    const model = dudoxx(process.env.DUDOXX_MODEL_NAME || 'dudoxx', {
      temperature: 0.7,
    });

    const { text, usage } = await generateText({
      model,
      maxTokens: 200,
      prompt: 'Write a creative haiku about artificial intelligence and the future.',
    });

    console.log('Prompt: Write a creative haiku about artificial intelligence and the future.');
    console.log('Response:');
    console.log(text);
    console.log(`\nUsage: ${usage?.totalTokens || 'unknown'} tokens\n`);

    // 2. Reasoning model generation
    console.log('2. Reasoning Model Generation');
    console.log('='.repeat(40));
    
    const reasoningModel = dudoxx(process.env.DUDOXX_REASONING_MODEL_NAME || 'dudoxx-reasoning', {
      temperature: 0.3,
      // Note: reasoningEffort is not supported by DUDOXX API
    });

    const { text: reasoningText, usage: reasoningUsage } = await generateText({
      model: reasoningModel,
      maxTokens: 400,
      prompt: `
        Solve this step by step:
        A store has 150 items. On Monday, they sell 25% of their inventory.
        On Tuesday, they receive 40 new items. On Wednesday, they sell 30 items.
        How many items do they have left?
        Show your work clearly.
      `,
    });

    console.log('Prompt: Multi-step math problem');
    console.log('Response:');
    console.log(reasoningText);
    console.log(`\nUsage: ${reasoningUsage?.totalTokens || 'unknown'} tokens\n`);

    // 3. Creative writing with higher temperature
    console.log('3. Creative Writing (High Temperature)');
    console.log('='.repeat(40));
    
    const creativeModel = dudoxx(process.env.DUDOXX_MODEL_NAME || 'dudoxx', {
      temperature: 0.9,
    });

    const { text: creativeText, usage: creativeUsage } = await generateText({
      model: creativeModel,
      maxTokens: 300,
      prompt: 'Write a short dialogue between a robot and a flower about the meaning of growth.',
    });

    console.log('Prompt: Creative dialogue between robot and flower');
    console.log('Response:');
    console.log(creativeText);
    console.log(`\nUsage: ${creativeUsage?.totalTokens || 'unknown'} tokens\n`);

    // 4. Multiple quick generations
    console.log('4. Quick Generations');
    console.log('='.repeat(40));

    const quickModel = dudoxx(process.env.DUDOXX_MODEL_NAME || 'dudoxx', {
      temperature: 0.5,
    });

    const quickPrompts = [
      'What is the capital of Japan?',
      'How do you make tea?',
      'Name a programming language.',
      'What color is the sky?',
    ];

    console.log('Running multiple quick generations...\n');

    for (const [index, prompt] of quickPrompts.entries()) {
      const { text } = await generateText({
        model: quickModel,
        maxTokens: 50,
        prompt,
      });
      
      console.log(`Q${index + 1}: ${prompt}`);
      console.log(`A${index + 1}: ${text.trim()}\n`);
    }

    // 5. Enhanced error handling demonstration
    console.log('5. Enhanced Error Handling Demo');
    console.log('='.repeat(40));

    console.log('Testing retry mechanism with withRetry wrapper...');

    const resilientGeneration = await withRetry(
      async () => {
        // This might fail intermittently, demonstrating retry logic
        const { text } = await generateText({
          model: quickModel,
          maxTokens: 100,
          prompt: 'Explain the benefits of error handling in AI applications.',
        });
        return text;
      },
      3, // max retries
      (error) => {
        const classification = classifyError(error);
        console.log(`Error classified as: ${classification.type} (retryable: ${classification.isRetryable})`);
        return classification.isRetryable;
      }
    );

    console.log('Resilient generation result:');
    console.log(resilientGeneration);
    console.log('');

    // 6. Performance test with monitoring
    console.log('6. Performance Test with Monitoring');
    console.log('='.repeat(40));

    const startTime = Date.now();
    
    const promises = [];
    for (let i = 0; i < 3; i++) {
      promises.push(
        generateText({
          model: quickModel,
          maxTokens: 50,
          prompt: `Write tip #${i + 1} for being productive`,
        })
      );
    }

    const results = await Promise.all(promises);
    const totalTime = Date.now() - startTime;

    console.log('Generated 3 responses simultaneously:');
    results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.text.trim()}`);
    });

    console.log(`\nTotal time: ${totalTime}ms`);
    console.log(`Average per request: ${Math.round(totalTime / 3)}ms`);

    // Enhanced monitoring statistics
    console.log('\n📊 Enhanced Monitoring Statistics:');
    console.log('='.repeat(40));
    const monitorStats = globalToolMonitor.getExecutionStats();
    console.log(`Tool executions completed: ${monitorStats.totalCompleted}`);
    console.log(`Success rate: ${(monitorStats.successRate * 100).toFixed(1)}%`);
    console.log(`Average execution time: ${monitorStats.averageDuration.toFixed(0)}ms`);
    console.log(`Error rate: ${(monitorStats.errorRate * 100).toFixed(1)}%`);

    // Summary
    const totalTokens = [usage, reasoningUsage, creativeUsage]
      .filter(u => u?.totalTokens)
      .reduce((sum, u) => sum + (u?.totalTokens || 0), 0);

    console.log('\n✅ Enhanced Generate demo completed successfully!');
    console.log(`Total tokens used: ${totalTokens}`);
    console.log('🎯 Enhanced features demonstrated:');
    console.log('- Error handling and retry mechanisms');
    console.log('- Performance monitoring and analytics');
    console.log('- Comprehensive tool execution tracking');
    console.log('All DUDOXX models are working correctly with enhanced capabilities.\n');

  } catch (error) {
    console.error('❌ Generate demo failed:', error);
    
    // Enhanced error reporting
    const classification = classifyError(error);
    console.error(`Error type: ${classification.type}`);
    console.error(`Retryable: ${classification.isRetryable}`);
    
    if (error instanceof DudoxxRateLimitError) {
      console.error(`Rate limit - retry after: ${error.retryAfter}s`);
    } else if (error instanceof DudoxxTimeoutError) {
      console.error(`Timeout - duration: ${error.timeoutMs}ms`);
    }
    
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateDemo();
}

export { generateDemo };