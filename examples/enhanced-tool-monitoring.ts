#!/usr/bin/env tsx

/**
 * Enhanced Tool Monitoring Example
 * Demonstrates advanced tool execution monitoring, error handling, and performance tracking
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { generateText, tool } from 'ai';
import { z } from 'zod';
import {
  dudoxx,
  globalToolMonitor,
  DudoxxToolExecutionMonitor,
  withRetry,
  classifyError,
  DudoxxRateLimitError,
  DudoxxTimeoutError,
  DudoxxToolError,
} from '../src/index';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.local') });

// Enhanced tool with built-in monitoring
const monitoredResearchTool = tool({
  description: 'Research information with enhanced monitoring and error handling',
  parameters: z.object({
    topic: z.string().describe('Research topic'),
    depth: z.enum(['shallow', 'medium', 'deep']).describe('Research depth'),
    timeout: z.number().optional().describe('Timeout in seconds'),
  }),
  execute: async ({ topic, depth, timeout = 10 }) => {
    // Use the global monitor for execution tracking
    const result = await globalToolMonitor.executeToolWithMonitoring(
      'research',
      { topic, depth, timeout },
      async (args) => {
        // Simulate different execution times based on depth
        const executionTime = {
          shallow: 1000,
          medium: 3000,
          deep: 8000,
        }[args.depth];

        // Simulate potential timeout
        if (args.timeout && executionTime > args.timeout * 1000) {
          throw new DudoxxTimeoutError(
            `Research timeout: ${args.timeout}s exceeded`,
            args.timeout * 1000
          );
        }

        // Simulate actual research work
        await new Promise(resolve => setTimeout(resolve, Math.min(executionTime, 2000)));

        // Simulate occasional failures
        if (Math.random() < 0.1) {
          throw new DudoxxToolError('Research service temporarily unavailable', 'research');
        }

        return {
          topic: args.topic,
          findings: [
            `Finding 1 about ${args.topic}`,
            `Finding 2 about ${args.topic}`,
            depth === 'deep' ? `Deep insight about ${args.topic}` : null,
          ].filter(Boolean),
          depth: args.depth,
          confidence: depth === 'deep' ? 0.95 : depth === 'medium' ? 0.80 : 0.65,
          sources: depth === 'deep' ? 8 : depth === 'medium' ? 5 : 3,
        };
      }
    );

    if (result.error) {
      throw result.error;
    }

    return result.result;
  },
});

// Analysis tool with retry logic
const resilientAnalysisTool = tool({
  description: 'Analyze data with automatic retry on failures',
  parameters: z.object({
    data: z.string().describe('Data to analyze'),
    analysisType: z.enum(['statistical', 'semantic', 'predictive']),
  }),
  execute: async ({ data, analysisType }) => {
    return await withRetry(
      async () => {
        // Simulate analysis work
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Simulate intermittent failures
        if (Math.random() < 0.3) {
          throw new Error('Analysis service error - retryable');
        }

        return {
          data: data.substring(0, 50) + '...',
          type: analysisType,
          results: [
            `${analysisType} analysis result 1`,
            `${analysisType} analysis result 2`,
          ],
          accuracy: Math.random() * 0.3 + 0.7, // 70-100%
          processingTime: '1.5s',
        };
      },
      3, // max retries
      (error) => {
        const classification = classifyError(error);
        return classification.isRetryable;
      }
    );
  },
});

async function demonstrateEnhancedToolMonitoring() {
  console.log('🔧 Enhanced Tool Monitoring & Error Handling Demo\n');

  console.log('Environment check:');
  console.log(`- DUDOXX_API_KEY: ${process.env.DUDOXX_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`- DUDOXX_BASE_URL: ${process.env.DUDOXX_BASE_URL || '❌ Missing'}`);
  console.log('');

  // Configure enhanced monitoring
  globalToolMonitor.updateConfig({
    timeoutMs: 15000,
    maxRetries: 2,
    enableMetrics: true,
    enablePerformanceTracking: true,
  });

  console.log('📊 Monitor Configuration:');
  console.log(JSON.stringify(globalToolMonitor.getConfig(), null, 2));
  console.log('');

  try {
    console.log('🔄 Executing enhanced agent workflow with monitoring...\n');

    const startTime = Date.now();

    const result = await generateText({
      model: dudoxx(process.env.DUDOXX_MODEL_NAME || 'dudoxx', {
        temperature: 0.7,
      }),
      maxTokens: 800,
      maxSteps: 8,
      tools: {
        research: monitoredResearchTool,
        analyze: resilientAnalysisTool,
      },
      messages: [
        {
          role: 'system',
          content: `You are an AI research assistant with enhanced monitoring capabilities. 
          Use the research tool to gather information and the analyze tool to process findings.
          Pay attention to tool execution performance and handle any errors gracefully.`,
        },
        {
          role: 'user',
          content: 'Research artificial intelligence trends in healthcare, then analyze the findings for market opportunities.',
        },
      ],
    });

    const totalTime = Date.now() - startTime;

    console.log('\n✅ Workflow completed successfully!');
    console.log(`⏱️ Total execution time: ${totalTime}ms\n`);

    console.log('📊 Tool Execution Statistics:');
    console.log('════════════════════════════════════════════════════════════');
    const stats = globalToolMonitor.getExecutionStats();
    console.log(`Active executions: ${stats.activeCount}`);
    console.log(`Total completed: ${stats.totalCompleted}`);
    console.log(`Success rate: ${(stats.successRate * 100).toFixed(1)}%`);
    console.log(`Average duration: ${stats.averageDuration.toFixed(0)}ms`);
    console.log(`Timeout rate: ${(stats.timeoutRate * 100).toFixed(1)}%`);
    console.log(`Error rate: ${(stats.errorRate * 100).toFixed(1)}%`);
    console.log('');

    // Show detailed metrics for each tool
    console.log('🔍 Detailed Tool Metrics:');
    console.log('────────────────────────────────────────────────────────────');
    
    const researchMetrics = globalToolMonitor.getToolMetrics('research');
    if (researchMetrics.length > 0) {
      console.log('Research Tool:');
      researchMetrics.forEach((metric, i) => {
        console.log(`  ${i + 1}. Status: ${metric.status} | Duration: ${metric.duration}ms | Retries: ${metric.retryCount}`);
      });
    }

    const analysisMetrics = globalToolMonitor.getToolMetrics('analyze');
    if (analysisMetrics.length > 0) {
      console.log('Analysis Tool:');
      analysisMetrics.forEach((metric, i) => {
        console.log(`  ${i + 1}. Status: ${metric.status} | Duration: ${metric.duration}ms | Retries: ${metric.retryCount}`);
      });
    }

    console.log('\n📝 Final Response:');
    console.log('────────────────────────────────────────────────────────────');
    console.log(result.text);

    console.log('\n📈 Usage Information:');
    console.log('────────────────────────────────────────────────────────────');
    console.log(`Tokens used: ${result.usage.totalTokens}`);
    console.log(`Tool calls: ${result.toolCalls?.length || 0}`);
    console.log(`Steps taken: ${result.steps?.length || 0}`);

  } catch (error) {
    console.error('\n❌ Workflow failed:');
    console.error('════════════════════════════════════════════════════════════');
    
    const classification = classifyError(error);
    console.error(`Error type: ${classification.type}`);
    console.error(`Retryable: ${classification.isRetryable}`);
    console.error(`Message: ${(error as Error).message}`);

    if (error instanceof DudoxxRateLimitError) {
      console.error(`Retry after: ${error.retryAfter}s`);
    } else if (error instanceof DudoxxTimeoutError) {
      console.error(`Timeout: ${error.timeoutMs}ms`);
    } else if (error instanceof DudoxxToolError) {
      console.error(`Tool: ${error.toolName}`);
      console.error(`Original error: ${error.originalError?.message}`);
    }

    // Still show metrics even on failure
    const stats = globalToolMonitor.getExecutionStats();
    console.log('\n📊 Execution Statistics (despite failure):');
    console.log(`Total attempts: ${stats.totalCompleted}`);
    console.log(`Success rate: ${(stats.successRate * 100).toFixed(1)}%`);
  }

  console.log('\n🎯 Enhanced Monitoring Features Demonstrated:');
  console.log('════════════════════════════════════════════════════════════');
  console.log('✅ Tool execution timeout protection');
  console.log('✅ Automatic retry with exponential backoff');
  console.log('✅ Comprehensive error classification');
  console.log('✅ Performance metrics tracking');
  console.log('✅ Real-time execution monitoring');
  console.log('✅ Memory usage tracking');
  console.log('✅ Success/failure rate analytics');
  console.log('✅ Detailed execution history');
}

// Run the demo
demonstrateEnhancedToolMonitoring().catch(console.error);