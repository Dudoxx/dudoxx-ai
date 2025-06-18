#!/usr/bin/env tsx

/**
 * AI Integration Test
 * Tests the weather tool with AI SDK integration
 */

import dotenv from 'dotenv';
import path from 'path';
import { generateText } from 'ai';
import { dudoxx, aiSdkWeatherTool } from '../src/index';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function testAIIntegration() {
  console.log('🤖 Testing AI SDK Integration\n');

  console.log('Environment check:');
  console.log(`- DUDOXX_API_KEY: ${process.env.DUDOXX_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`- DUDOXX_BASE_URL: ${process.env.DUDOXX_BASE_URL || '❌ Missing'}`);
  console.log(`- DUDOXX_MODEL_NAME: ${process.env.DUDOXX_MODEL_NAME || '❌ Missing'}`);
  console.log('');

  try {
    console.log('🔄 Making request to DUDOXX with weather tool...\n');

    const result = await generateText({
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
          content: 'You are a helpful weather assistant. When asked about weather, use the get_weather tool to fetch current conditions and provide a detailed, friendly response.',
        },
        {
          role: 'user',
          content: 'What\'s the weather like in New York? Please give me all the details.',
        },
      ],
    });

    console.log('📊 Conversation Flow:');
    console.log('─'.repeat(40));
    console.log(`🔢 Total Steps: ${result.steps?.length || 1}`);
    console.log(`🔢 Total Tokens: ${result.usage?.totalTokens || 'N/A'}`);
    console.log(`🔢 Prompt Tokens: ${result.usage?.promptTokens || 'N/A'}`);
    console.log(`🔢 Completion Tokens: ${result.usage?.completionTokens || 'N/A'}`);

    // Show each step in the conversation
    if (result.steps && result.steps.length > 0) {
      console.log('\n🔄 Step-by-Step Flow:');
      result.steps.forEach((step, index) => {
        console.log(`\nStep ${index + 1}:`);
        
        if (step.text) {
          console.log(`   💬 Assistant: ${step.text}`);
        }
        
        if (step.toolCalls && step.toolCalls.length > 0) {
          console.log(`   🔧 Tool Calls: ${step.toolCalls.length}`);
          step.toolCalls.forEach((call, callIndex) => {
            console.log(`      ${callIndex + 1}. ${call.toolName}(${JSON.stringify(call.args)})`);
          });
        }
        
        if (step.toolResults && step.toolResults.length > 0) {
          console.log(`   📊 Tool Results: ${step.toolResults.length}`);
          step.toolResults.forEach((toolResult, resultIndex) => {
            const result = toolResult.result as { data?: unknown; message?: string; [key: string]: unknown };
            if (result?.data) {
              console.log(`      ${resultIndex + 1}. ${result.message || JSON.stringify(result.data)}`);
            } else {
              console.log(`      ${resultIndex + 1}. ${JSON.stringify(toolResult.result)}`);
            }
          });
        }
      });
    }

    console.log('\n✅ Final Response:');
    console.log('─'.repeat(40));
    console.log(result.text || '(no final text response)');

    console.log('\n✅ AI Integration test completed successfully!');

  } catch (error) {
    console.error('❌ AI Integration test failed:', error);
    
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
      if (error.message.includes('model')) {
        console.log('- Issue: Model configuration problem');
        console.log('- Solution: Check DUDOXX_MODEL_NAME in .env.local');
      }
    }
    
    throw error;
  }
}

testAIIntegration();