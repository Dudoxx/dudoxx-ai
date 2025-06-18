#!/usr/bin/env tsx

// Load environment variables
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { streamText } from 'ai';
import { createDudoxx } from '../src/index';

/**
 * Demo: Streaming text generation with DUDOXX models
 */
async function streamingDemo() {
  console.log('🌊 DUDOXX Streaming Demo\n');

  // Initialize DUDOXX provider
  const dudoxx = createDudoxx({
    baseURL: process.env.DUDOXX_BASE_URL,
    apiKey: process.env.DUDOXX_API_KEY,
  });

  try {
    // 1. Basic streaming
    console.log('1. Basic Streaming');
    console.log('='.repeat(40));
    
    const model = dudoxx(process.env.DUDOXX_MODEL_NAME || 'dudoxx', {
      temperature: 0.7,
    });

    console.log('Prompt: Explain quantum computing in simple terms');
    console.log('Streaming response:');
    console.log('-'.repeat(30));

    const result1 = streamText({
      model,
      maxTokens: 300,
      prompt: 'Explain quantum computing in simple terms, as if talking to a curious teenager.',
    });

    // Stream the response
    for await (const chunk of result1.textStream) {
      process.stdout.write(chunk);
      // Add small delay for visual effect
      await new Promise(resolve => setTimeout(resolve, 20));
    }

    const finalResult1 = await result1.text;
    console.log('\n');
    console.log(`Final text length: ${finalResult1.length} characters\n`);

    // 2. Reasoning model streaming
    console.log('2. Reasoning Model Streaming');
    console.log('='.repeat(40));
    
    const reasoningModel = dudoxx(process.env.DUDOXX_REASONING_MODEL_NAME || 'dudoxx-reasoning', {
      temperature: 0.3,
    });

    console.log('Prompt: Complex problem solving');
    console.log('Streaming response:');
    console.log('-'.repeat(30));

    const result2 = streamText({
      model: reasoningModel,
      maxTokens: 400,
      prompt: `
        A company has 3 departments: Sales, Marketing, and Engineering.
        - Sales has 15 people, each earning $60,000/year
        - Marketing has 8 people, each earning $70,000/year  
        - Engineering has 12 people, each earning $90,000/year
        
        Calculate:
        1. Total annual cost for each department
        2. Average salary across all employees
        3. If the company gives everyone a 5% raise, what's the new total cost?
        
        Show your step-by-step calculations.
      `,
    });

    for await (const chunk of result2.textStream) {
      process.stdout.write(chunk);
      await new Promise(resolve => setTimeout(resolve, 15));
    }

    const finalResult2 = await result2.text;
    console.log('\n');
    console.log(`Calculation completed: ${finalResult2.length} characters\n`);

    // 3. Creative streaming with higher temperature
    console.log('3. Creative Streaming');
    console.log('='.repeat(40));
    
    const creativeModel = dudoxx(process.env.DUDOXX_MODEL_NAME || 'dudoxx', {
      temperature: 0.9,
    });

    console.log('Prompt: Creative story writing');
    console.log('Streaming response:');
    console.log('-'.repeat(30));

    const result3 = streamText({
      model: creativeModel,
      maxTokens: 350,
      prompt: 'Write a short story about a time traveler who accidentally changes history by leaving behind a modern smartphone in ancient Rome.',
    });

    for await (const chunk of result3.textStream) {
      process.stdout.write(chunk);
      await new Promise(resolve => setTimeout(resolve, 25));
    }

    const finalResult3 = await result3.text;
    console.log('\n');
    console.log(`Story completed: ${finalResult3.length} characters\n`);

    // 4. Multiple concurrent streams
    console.log('4. Concurrent Streaming');
    console.log('='.repeat(40));

    const quickModel = dudoxx(process.env.DUDOXX_MODEL_NAME || 'dudoxx', {
      temperature: 0.6,
    });

    const streamPrompts = [
      'Describe the benefits of renewable energy',
      'Explain machine learning in one paragraph',
      'What makes a good leader?',
    ];

    console.log('Starting 3 concurrent streams...\n');

    const streamPromises = streamPrompts.map(async (prompt, index) => {
      console.log(`Stream ${index + 1}: ${prompt}`);
      console.log(`Response ${index + 1}:`);
      console.log('-'.repeat(20));

      const result = streamText({
        model: quickModel,
        maxTokens: 150,
        prompt,
      });

      let text = '';
      for await (const chunk of result.textStream) {
        process.stdout.write(chunk);
        text += chunk;
        await new Promise(resolve => setTimeout(resolve, 30));
      }

      console.log('\n');
      return { prompt, text, length: text.length };
    });

    const concurrentResults = await Promise.all(streamPromises);

    console.log('\nConcurrent streaming summary:');
    concurrentResults.forEach((result, index) => {
      console.log(`${index + 1}. ${result.length} characters`);
    });

    // 5. Streaming with chunk analysis
    console.log('\n5. Streaming with Chunk Analysis');
    console.log('='.repeat(40));

    console.log('Prompt: Technical explanation with chunk monitoring');
    console.log('Response (with chunk info):');
    console.log('-'.repeat(30));

    const result5 = streamText({
      model,
      maxTokens: 300,
      prompt: 'Explain how blockchain technology works, including its key components and benefits.',
    });

    let chunkCount = 0;
    let totalChars = 0;
    const startTime = Date.now();

    for await (const chunk of result5.textStream) {
      chunkCount++;
      totalChars += chunk.length;
      process.stdout.write(chunk);
      
      // Show chunk info every 10 chunks
      if (chunkCount % 10 === 0) {
        process.stdout.write(`\n[Chunk ${chunkCount}, ${chunk.length} chars]`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    const totalTime = Date.now() - startTime;
    const finalResult5 = await result5.text;
    console.log(`Final result length: ${finalResult5.length} characters`);

    console.log('\n\nStreaming statistics:');
    console.log(`Total chunks: ${chunkCount}`);
    console.log(`Total characters: ${totalChars}`);
    console.log(`Average chunk size: ${Math.round(totalChars / chunkCount)} chars`);
    console.log(`Total time: ${totalTime}ms`);
    console.log(`Streaming rate: ${Math.round(totalChars / (totalTime / 1000))} chars/sec`);

    // 6. Error handling test
    console.log('\n6. Streaming Error Handling');
    console.log('='.repeat(40));

    try {
      const errorModel = dudoxx(process.env.DUDOXX_MODEL_NAME || 'dudoxx', {
        temperature: 0.5,
      });

      console.log('Testing with very small token limit...');
      const errorResult = streamText({
        model: errorModel,
        maxTokens: 10, // Very small to potentially trigger issues
        prompt: 'Write a long essay about the history of computing.',
      });

      let chars = 0;
      for await (const chunk of errorResult.textStream) {
        chars += chunk.length;
        process.stdout.write(chunk);
      }

      console.log(`\n✅ Short response handled gracefully (${chars} chars)`);

    } catch (error) {
      console.log(`❌ Error handled: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    console.log('\n✅ Streaming demo completed successfully!');
    console.log('All streaming features are working correctly.');
    console.log('Real-time text generation confirmed with DUDOXX models.\n');

  } catch (error) {
    console.error('❌ Streaming demo failed:', error);
    throw error;
  }
}

// Performance monitoring utilities
class StreamingMonitor {
  private startTime: number = 0;
  private chunkCount: number = 0;
  private totalChars: number = 0;

  start() {
    this.startTime = Date.now();
    this.chunkCount = 0;
    this.totalChars = 0;
  }

  addChunk(chunk: string) {
    this.chunkCount++;
    this.totalChars += chunk.length;
  }

  getStats() {
    const duration = Date.now() - this.startTime;
    return {
      duration,
      chunkCount: this.chunkCount,
      totalChars: this.totalChars,
      avgChunkSize: Math.round(this.totalChars / this.chunkCount),
      charsPerSecond: Math.round(this.totalChars / (duration / 1000)),
    };
  }
}

// Advanced streaming demo
async function advancedStreamingDemo() {
  console.log('\n🔬 Advanced Streaming Analysis');
  console.log('='.repeat(40));

  const dudoxx = createDudoxx({
    baseURL: process.env.DUDOXX_BASE_URL,
    apiKey: process.env.DUDOXX_API_KEY,
  });

  const model = dudoxx(process.env.DUDOXX_MODEL_NAME || 'dudoxx', {
    temperature: 0.7,
  });

  const monitor = new StreamingMonitor();
  monitor.start();

  console.log('Monitoring streaming performance...\n');

  const result = streamText({
    model,
    maxTokens: 200,
    prompt: 'Describe the evolution of artificial intelligence from the 1950s to today.',
  });

  for await (const chunk of result.textStream) {
    monitor.addChunk(chunk);
    process.stdout.write(chunk);
    await new Promise(resolve => setTimeout(resolve, 15));
  }

  const stats = monitor.getStats();
  console.log('\n\nPerformance Analysis:');
  console.log(`Duration: ${stats.duration}ms`);
  console.log(`Chunks: ${stats.chunkCount}`);
  console.log(`Characters: ${stats.totalChars}`);
  console.log(`Avg chunk size: ${stats.avgChunkSize}`);
  console.log(`Speed: ${stats.charsPerSecond} chars/sec`);
}

// Run if called directly
if (require.main === module) {
  async function runDemo() {
    await streamingDemo();
    await advancedStreamingDemo();
  }
  
  runDemo();
}

export { streamingDemo, StreamingMonitor };