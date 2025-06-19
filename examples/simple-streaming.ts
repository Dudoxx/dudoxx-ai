#!/usr/bin/env tsx

/**
 * Simple Streaming Example
 * Demonstrates basic streaming with the DUDOXX provider
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { streamText } from 'ai';
import { dudoxx } from '../src/index';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.local') });

async function testSimpleStreaming() {
  console.log('🌊 Testing Simple Streaming\n');

  console.log('Environment check:');
  console.log(`- DUDOXX_API_KEY: ${process.env.DUDOXX_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`- DUDOXX_BASE_URL: ${process.env.DUDOXX_BASE_URL || '❌ Missing'}`);
  console.log('');

  try {
    console.log('🔄 Starting streaming request...\n');

    const result = await streamText({
      model: dudoxx(process.env.DUDOXX_MODEL_NAME || 'dudoxx', {
        temperature: 0.7,
      }),
      maxTokens: 500,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant. Provide detailed and informative responses.',
        },
        {
          role: 'user',
          content: 'Write a short story about a robot learning to paint. Make it engaging and creative.',
        },
      ],
    });

    console.log('📝 Streaming response:\n');
    console.log('─'.repeat(60));

    // Stream the text response
    for await (const textPart of result.textStream) {
      process.stdout.write(textPart);
    }

    // Get final results
    const finalResult = await result.text;
    const usage = await result.usage;
    console.log(`📝 Complete text length: ${finalResult.length} characters`);

    console.log('\n');
    console.log('─'.repeat(60));
    console.log('\n📊 Final Results:');
    
    // Handle the case where DUDOXX streaming doesn't provide usage data
    if (usage.totalTokens > 0 || usage.promptTokens > 0 || usage.completionTokens > 0) {
      console.log(`🔢 Total Tokens: ${usage.totalTokens}`);
      console.log(`🔢 Prompt Tokens: ${usage.promptTokens}`);
      console.log(`🔢 Completion Tokens: ${usage.completionTokens}`);
    } else {
      console.log('🔢 Token Usage: Not available in streaming mode for DUDOXX provider');
      console.log('💡 Note: Use generateText() instead of streamText() to get accurate token counts');
    }

    console.log('\n✅ Simple streaming test completed successfully!');

  } catch (error) {
    console.error('❌ Streaming test failed:', error);
    
    if (error instanceof Error) {
      console.log('\n🔍 Error Analysis:');
      if (error.message.includes('API key')) {
        console.log('- Issue: API key problem');
        console.log('- Solution: Check DUDOXX_API_KEY in .env.local');
      }
      if (error.message.includes('fetch') || error.message.includes('network')) {
        console.log('- Issue: Network/connection problem');
        console.log('- Solution: Check internet connection and DUDOXX_BASE_URL');
      }
      if (error.message.includes('stream')) {
        console.log('- Issue: Streaming problem');
        console.log('- Solution: Check DUDOXX streaming API compatibility');
      }
    }
    
    throw error;
  }
}

testSimpleStreaming();