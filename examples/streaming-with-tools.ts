#!/usr/bin/env tsx

/**
 * Streaming with Tools Example
 * Demonstrates streaming responses with parallel tool execution using generateText + streamText workflow
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { generateText, streamText, tool } from 'ai';
import { z } from 'zod';
import { dudoxx } from '../src/index';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.local') });

// Global counter for tracking tool executions across parallel calls
let globalToolExecutionCount = 0;

// Enhanced weather tool for streaming demo
const weatherTool = tool({
  description: 'Get current weather information for a specified location',
  parameters: z.object({
    city: z.string().describe('The city name'),
    country: z.string().optional().describe('The country code (optional)'),
  }),
  execute: async ({ city, country }) => {
    // Simulate API delay for realistic streaming
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
    
    const location = country ? `${city}, ${country}` : city;
    globalToolExecutionCount++;
    
    console.log(`🔧 WEATHER TOOL EXECUTED for ${location} (#${globalToolExecutionCount})`);
    
    return {
      location,
      temperature: Math.floor(Math.random() * 30) + 10,
      condition: ['sunny', 'cloudy', 'rainy', 'snowy'][Math.floor(Math.random() * 4)],
      humidity: Math.floor(Math.random() * 100),
      windSpeed: Math.floor(Math.random() * 20) + 5,
      message: `Current weather in ${location}`,
    };
  },
});

// Time tool for parallel execution
const timeTool = tool({
  description: 'Get current time for a location',
  parameters: z.object({
    location: z.string().describe('Location to get time for'),
  }),
  execute: async ({ location }) => {
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 300));
    
    globalToolExecutionCount++;
    console.log(`🕐 TIME TOOL EXECUTED for ${location} (#${globalToolExecutionCount})`);
    
    const now = new Date();
    return {
      location,
      currentTime: now.toLocaleTimeString(),
      timezone: 'UTC',
      timestamp: now.toISOString(),
    };
  },
});

// Travel recommendation tool for parallel execution
const travelTool = tool({
  description: 'Get travel recommendations for a city',
  parameters: z.object({
    city: z.string().describe('City to get recommendations for'),
  }),
  execute: async ({ city }) => {
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));
    
    globalToolExecutionCount++;
    console.log(`🗺️ TRAVEL TOOL EXECUTED for ${city} (#${globalToolExecutionCount})`);
    
    const recommendations = [
      'Visit local museums',
      'Try traditional cuisine',
      'Explore historic districts',
      'Take walking tours',
      'Visit parks and gardens'
    ];
    
    return {
      city,
      recommendations: recommendations.slice(0, 3),
      bestTimeToVisit: 'Spring or Fall',
      message: `Travel recommendations for ${city}`,
    };
  },
});

async function testStreamingWithTools() {
  console.log('🌊 Testing Streaming with Parallel Tool Execution\n');

  console.log('Environment check:');
  console.log(`- DUDOXX_API_KEY: ${process.env.DUDOXX_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`- DUDOXX_BASE_URL: ${process.env.DUDOXX_BASE_URL || '❌ Missing'}`);
  console.log('');

  try {
    console.log('📋 Strategy: DUDOXX provider uses generateText for tools + streamText for final response\n');
    
    // Step 1: Execute tools with generateText for parallel execution
    console.log('🔄 Step 1: Executing parallel tool calls...\n');
    
    const toolResult = await generateText({
      model: dudoxx(process.env.DUDOXX_MODEL_NAME || 'dudoxx', {
        temperature: 0.7,
      }),
      maxTokens: 1000,
      tools: {
        get_weather: weatherTool,
        get_time: timeTool,
        get_travel_info: travelTool,
      },
      maxSteps: 5,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful travel assistant. Use all available tools to gather comprehensive information about the cities mentioned. Call tools for each city when requested. Respond in French.',
        },
        {
          role: 'user',
          content: 'I need information about Paris and London. Get the weather, current time, and travel recommendations for both cities using all available tools.',
        },
      ],
    });

    console.log('\n✅ Tool execution completed!');
    console.log(`📝 Steps taken: ${toolResult.steps.length}`);
    console.log(`🔧 Total tool calls: ${globalToolExecutionCount}`);
    
    // Show tool execution details
    for (let i = 0; i < toolResult.steps.length; i++) {
      const step = toolResult.steps[i];
      if (step.toolCalls && step.toolCalls.length > 0) {
        console.log(`\n🔧 Step ${i + 1} - Tool calls executed:`);
        for (const call of step.toolCalls) {
          console.log(`   • ${call.toolName}: ${JSON.stringify(call.args)}`);
        }
      }
    }

    console.log(`\n💬 Initial response from tools:\n${toolResult.text}\n`);

    // Step 2: Stream a follow-up detailed response
    console.log('🔄 Step 2: Streaming detailed recommendations...\n');

    const streamResult = await streamText({
      model: dudoxx(process.env.DUDOXX_MODEL_NAME || 'dudoxx', {
        temperature: 0.8,
      }),
      maxTokens: 800,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful travel assistant. Based on the previous tool results, provide detailed, personalized travel recommendations with specific activities, restaurants, and tips. Be enthusiastic and helpful.',
        },
        {
          role: 'user',
          content: `Based on this information about Paris and London: "${toolResult.text}", please provide a detailed streaming response with specific travel recommendations, activities to do in this weather, and helpful tips for visiting both cities. Include restaurant recommendations and weather-appropriate activities.`,
        },
      ],
    });

    console.log('🌊 Streaming detailed response:');
    console.log('─'.repeat(60));

    let streamedText = '';
    let charCount = 0;

    for await (const delta of streamResult.textStream) {
      process.stdout.write(delta);
      streamedText += delta;
      charCount += delta.length;
    }

    console.log(`\n📊 Streamed ${charCount} characters\n`);
    console.log('─'.repeat(60));

    // Final results
    const toolUsage = toolResult.usage;
    const streamUsage = await streamResult.usage;
    
    console.log('\n📊 Final Results:');
    console.log('─'.repeat(40));
    console.log(`🔧 Tool calls executed: ${globalToolExecutionCount}`);
    console.log(`📝 Tool execution tokens: ${toolUsage.totalTokens}`);
    console.log(`🌊 Streaming tokens: Not available for DUDOXX provider`);
    console.log(`📊 Total workflow: Tools + Streaming completed successfully`);

    console.log('\n✅ Complete streaming with tools workflow finished!');
    console.log('\n📝 Summary:');
    console.log('   1. ✅ Parallel tool execution with generateText');
    console.log('   2. ✅ Real-time streaming response with streamText');
    console.log('   3. ✅ DUDOXX provider handles both scenarios optimally');

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
      if (error.message.includes('tool')) {
        console.log('- Issue: Tool execution problem');
        console.log('- Solution: Check tool definitions and parameters');
      }
    }
    
    throw error;
  }
}

testStreamingWithTools();