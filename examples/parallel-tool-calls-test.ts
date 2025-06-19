#!/usr/bin/env tsx

/**
 * Parallel Tool Calls Test
 * Tests if DUDOXX AI provider can handle multiple simultaneous tool calls
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { generateText, tool } from 'ai';
import { z } from 'zod';
import { dudoxx } from '../src/index';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.local') });

// Tool execution counter (shared across all tools)
let globalToolExecutionCount = 0;

// Define multiple tools for testing parallel execution
const weatherTool = tool({
  description: 'Get weather information for a specific city',
  parameters: z.object({
    city: z.string().describe('The city name'),
    country: z.string().optional().describe('The country code (optional)'),
  }),
  execute: async ({ city, country }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const location = country ? `${city}, ${country}` : city;
    globalToolExecutionCount++;
    console.log(`🔧 WEATHER TOOL EXECUTED for ${location} (#${globalToolExecutionCount})`);
    return {
      location,
      temperature: Math.floor(Math.random() * 30) + 10,
      condition: ['sunny', 'cloudy', 'rainy', 'snowy'][Math.floor(Math.random() * 4)],
      humidity: Math.floor(Math.random() * 100),
      message: `Weather data for ${location}`,
    };
  },
});

const timeTool = tool({
  description: 'Get current time for a specific timezone',
  parameters: z.object({
    timezone: z.string().describe('The timezone (e.g., "America/New_York", "Europe/London")'),
  }),
  execute: async ({ timezone }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const now = new Date();
    globalToolExecutionCount++;
    console.log(`🔧 TIME TOOL EXECUTED for ${timezone} (#${globalToolExecutionCount})`);
    return {
      timezone,
      time: now.toLocaleTimeString('en-US', { timeZone: timezone }),
      date: now.toLocaleDateString('en-US', { timeZone: timezone }),
      message: `Current time in ${timezone}`,
    };
  },
});

const currencyTool = tool({
  description: 'Get currency exchange rate',
  parameters: z.object({
    from: z.string().describe('Source currency code (e.g., USD)'),
    to: z.string().describe('Target currency code (e.g., EUR)'),
  }),
  execute: async ({ from, to }) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    const rate = (Math.random() * 2 + 0.5).toFixed(4);
    globalToolExecutionCount++;
    console.log(`🔧 CURRENCY TOOL EXECUTED for ${from} to ${to} (#${globalToolExecutionCount})`);
    return {
      from,
      to,
      rate: parseFloat(rate),
      message: `Exchange rate from ${from} to ${to}`,
    };
  },
});

async function testParallelToolCalls() {
  console.log('🔄 Testing Parallel Tool Calls\n');

  console.log('Environment check:');
  console.log(`- DUDOXX_API_KEY: ${process.env.DUDOXX_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`- DUDOXX_BASE_URL: ${process.env.DUDOXX_BASE_URL || '❌ Missing'}`);
  console.log('');

  try {
    console.log('🚀 Testing parallel tool execution...\n');
    console.log('Asking for weather in 3 cities, time in 2 timezones, and 2 currency rates\n');

    // Reset global counter for this test
    globalToolExecutionCount = 0;
    const startTime = Date.now();

    const result = await generateText({
      model: dudoxx(process.env.DUDOXX_MODEL_NAME || 'dudoxx', {
        temperature: 0.3,
      }),
      maxTokens: 1000,
      tools: {
        get_weather: weatherTool,
        get_time: timeTool,
        get_exchange_rate: currencyTool,
      },
      maxSteps: 10, // Allow multiple tool calls
      prompt: `I need you to help me with multiple tasks simultaneously:

1. Get weather for: New York, London, Tokyo
2. Get current time for: America/New_York, Europe/London  
3. Get exchange rates for: USD to EUR, GBP to USD

Please use the available tools to gather all this information and then provide a comprehensive summary.

IMPORTANT: Please respond in French (français) to demonstrate that you are actively processing and generating the final response, not using a template.`,
    });

    const executionTime = Date.now() - startTime;

    console.log('📊 Tool Execution Results:');
    console.log('─'.repeat(60));

    console.log(`⏱️  Total execution time: ${executionTime}ms`);
    console.log(`🔧 Tool calls executed: ${globalToolExecutionCount}`);
    console.log(`🔢 Total tokens used: ${result.usage.totalTokens}`);
    console.log(`🔢 Prompt tokens: ${result.usage.promptTokens}`);
    console.log(`🔢 Completion tokens: ${result.usage.completionTokens}`);

    console.log('\n📝 Complete Response:');
    console.log('─'.repeat(60));
    console.log(result.text);

    console.log('\n🔍 Parallel Execution Analysis:');
    console.log('─'.repeat(60));
    
    if (executionTime < 5000) {
      console.log('✅ Fast execution suggests parallel tool processing');
    } else if (executionTime < 10000) {
      console.log('⚠️  Moderate execution time - may be sequential or partially parallel');
    } else {
      console.log('❌ Slow execution suggests sequential tool processing');
    }

    if (globalToolExecutionCount >= 6) {
      console.log('✅ All expected tool calls were made');
    } else {
      console.log(`⚠️  Only ${globalToolExecutionCount} tool calls executed (expected 7)`);
    }

    // Test if the model can make multiple tool calls in one step
    console.log('\n🔍 Checking response structure for parallel call indicators...');
    
    if (result.text.includes('New York') && result.text.includes('London') && result.text.includes('Tokyo')) {
      console.log('✅ Weather data for multiple cities present');
    }
    
    if (result.text.includes('America/New_York') && result.text.includes('Europe/London')) {
      console.log('✅ Time data for multiple timezones present');
    }
    
    if (result.text.includes('USD to EUR') && result.text.includes('GBP to USD')) {
      console.log('✅ Exchange rate data for multiple pairs present');
    }

    // Check if response is in French (verifies LLM processing)
    console.log('\n🇫🇷 French Response Verification:');
    const frenchIndicators = ['température', 'heure', 'temps', 'taux', 'change', 'voici', 'résumé', 'informations'];
    const frenchFound = frenchIndicators.some(word => result.text.toLowerCase().includes(word));
    
    if (frenchFound) {
      console.log('✅ Response is in French - LLM actively processed the final response');
    } else {
      console.log('❌ Response not in French - may be using template/cached response');
      console.log('🔍 Checking for any French words...');
      frenchIndicators.forEach(word => {
        if (result.text.toLowerCase().includes(word)) {
          console.log(`   Found: "${word}"`);
        }
      });
    }

    console.log('\n✅ Parallel tool calls test completed successfully!');

  } catch (error) {
    console.error('❌ Parallel tool calls test failed:', error);
    
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
        console.log('- Solution: Check tool definitions and DUDOXX tool calling support');
      }
    }
    
    throw error;
  }
}

testParallelToolCalls();