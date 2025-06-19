#!/usr/bin/env tsx

/**
 * Streaming with Tools Example
 * Demonstrates streaming responses with tool calls and final formatted response
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { streamText } from 'ai';
import { dudoxx, aiSdkWeatherTool } from '../src/index';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.local') });

async function testStreamingWithTools() {
  console.log('🌊 Testing Streaming with Tools\n');

  console.log('Environment check:');
  console.log(`- DUDOXX_API_KEY: ${process.env.DUDOXX_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`- DUDOXX_BASE_URL: ${process.env.DUDOXX_BASE_URL || '❌ Missing'}`);
  console.log('');

  try {
    console.log('🔄 Starting streaming request with weather tool...\n');

    const result = await streamText({
      model: dudoxx(process.env.DUDOXX_MODEL_NAME || 'dudoxx', {
        temperature: 0.7,
        maxTokens: 500,
      }),
      tools: {
        get_weather: aiSdkWeatherTool,
      },
      maxSteps: 5, // Allow multiple steps for tool calls and final response
      messages: [
        {
          role: 'system',
          content: 'You are a helpful weather assistant. When asked about weather, use the get_weather tool to fetch current conditions and provide a detailed, friendly response with recommendations.',
        },
        {
          role: 'user',
          content: 'What\'s the weather like in San Francisco? Should I bring a jacket?',
        },
      ],
    });

    console.log('🔄 Processing stream...\n');

    let finalText = '';
    let toolCallCount = 0;
    let stepCount = 0;

    // Stream the response step by step
    console.log('💬 Streaming conversation:');
    
    // Use the baseStream which contains the raw streaming parts
    for await (const streamPart of result.baseStream) {
      const part = streamPart.part;
      
      switch (part.type) {
        case 'step-start':
          stepCount++;
          console.log(`\n📍 Step ${stepCount} started`);
          break;
          
        case 'tool-call':
          toolCallCount++;
          console.log(`🔧 Tool Call ${toolCallCount}: ${part.toolName}`);
          console.log(`   Args: ${JSON.stringify(part.args)}`);
          break;
          
        case 'tool-result': {
          console.log(`📊 Tool Result:`);
          const toolResult = part.result as { message?: string; [key: string]: unknown };
          if (toolResult?.message) {
            console.log(`   ${toolResult.message}`);
          } else {
            console.log(`   ${JSON.stringify(toolResult, null, 2)}`);
          }
          break;
        }
          
        case 'text-delta':
          if (!finalText) {
            console.log('\n💬 Assistant response:');
          }
          process.stdout.write(part.textDelta);
          finalText += part.textDelta;
          break;
          
        case 'step-finish':
          console.log(`\n✅ Step ${stepCount} completed`);
          break;
          
        case 'finish':
          console.log('\n🏁 Conversation finished');
          break;
          
        default:
          console.log(`🔍 Unknown part type: ${(part as { type?: string }).type || 'unknown'}`);
      }
    }

    // Get final results
    const finalResult = await result.text;
    const usage = await result.usage;
    
    console.log('\n\n📊 Final Results:');
    console.log('─'.repeat(40));
    console.log(`🔢 Total Tokens: ${usage.totalTokens}`);
    console.log(`🔢 Prompt Tokens: ${usage.promptTokens}`);
    console.log(`🔢 Completion Tokens: ${usage.completionTokens}`);

    console.log('\n🎯 Complete Response:');
    console.log('─'.repeat(40));
    console.log(finalResult);

    console.log('\n✅ Streaming with tools test completed successfully!');

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
    }
    
    throw error;
  }
}

testStreamingWithTools();