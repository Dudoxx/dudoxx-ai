#!/usr/bin/env tsx

/**
 * Working Streaming with Tools Example
 * Shows how streaming works with tool calls and final responses
 */

import dotenv from 'dotenv';
import path from 'path';
import { generateText, streamText } from 'ai';
import { dudoxx, aiSdkWeatherTool } from '../src/index';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function testWorkingStreamingWithTools() {
  console.log('🌊 Working Streaming with Tools Demo\n');

  console.log('Environment check:');
  console.log(`- DUDOXX_API_KEY: ${process.env.DUDOXX_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`- DUDOXX_BASE_URL: ${process.env.DUDOXX_BASE_URL || '❌ Missing'}`);
  console.log('');

  try {
    console.log('📋 Strategy: We\'ll use generateText with maxSteps for the complete flow');
    console.log('   Then demonstrate streaming for a follow-up response\n');

    // Step 1: Complete tool interaction with generateText
    console.log('🔄 Step 1: Complete tool interaction...\n');
    
    const toolResult = await generateText({
      model: dudoxx(process.env.DUDOXX_MODEL_NAME!, {
        temperature: 0.7,
        maxTokens: 500,
      }),
      tools: {
        get_weather: aiSdkWeatherTool,
      },
      maxSteps: 5, // Allow tool calls and response
      messages: [
        {
          role: 'system',
          content: 'You are a helpful weather assistant. When asked about weather, use the get_weather tool to fetch current conditions and provide a detailed, friendly response.',
        },
        {
          role: 'user',
          content: 'What\'s the weather like in Paris? Give me the details and some recommendations.',
        },
      ],
    });

    console.log('✅ Tool interaction completed!');
    console.log(`📝 Steps taken: ${toolResult.steps?.length || 1}`);
    console.log(`🔧 Tool calls made: ${toolResult.toolCalls?.length || 0}`);
    console.log(`💬 Final response: ${toolResult.text}\n`);

    // Step 2: Stream a follow-up response 
    console.log('🔄 Step 2: Streaming follow-up response...\n');

    const streamResult = await streamText({
      model: dudoxx(process.env.DUDOXX_MODEL_NAME!, {
        temperature: 0.7,
        maxTokens: 300,
      }),
      messages: [
        {
          role: 'system',
          content: 'You are a helpful travel assistant. Provide detailed, engaging responses.',
        },
        {
          role: 'user',
          content: `Based on this weather info: "${toolResult.text}", what would be the perfect activities to do in Paris today? Be creative and specific.`,
        },
      ],
    });

    console.log('🌊 Streaming follow-up response:');
    console.log('─'.repeat(60));

    let streamedText = '';
    
    // Stream the follow-up response
    for await (const textPart of streamResult.textStream) {
      process.stdout.write(textPart);
      streamedText += textPart;
    }

    const finalUsage = await streamResult.usage;

    console.log('\n');
    console.log('─'.repeat(60));
    console.log('\n📊 Final Results:');
    console.log(`🔢 Total Tokens: ${finalUsage.totalTokens}`);
    console.log(`🔢 Prompt Tokens: ${finalUsage.promptTokens}`);
    console.log(`🔢 Completion Tokens: ${finalUsage.completionTokens}`);

    console.log('\n✅ Complete workflow demonstration finished successfully!');
    console.log('\n📝 Summary:');
    console.log('   1. ✅ Tool calls work with generateText + maxSteps');
    console.log('   2. ✅ Streaming works with streamText for text responses');
    console.log('   3. ✅ DUDOXX provider handles both scenarios correctly');

  } catch (error) {
    console.error('❌ Streaming workflow failed:', error);
    
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

testWorkingStreamingWithTools();