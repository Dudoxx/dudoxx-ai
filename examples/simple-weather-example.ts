#!/usr/bin/env tsx

/**
 * Simple Weather Tool Example
 * 
 * A minimal example showing how to use the weather tool with DUDOXX-AI
 */

import dotenv from 'dotenv';
import path from 'path';
import { generateText } from 'ai';
import { dudoxx, aiSdkWeatherTool } from '../src/index';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function simpleWeatherExample() {
  console.log('🌤️ Simple Weather Tool Example\n');

  try {
    console.log('🤖 Asking DUDOXX about weather in New York...\n');

    const result = await generateText({
      model: dudoxx(process.env.DUDOXX_MODEL_NAME || 'dudoxx'),
      tools: {
        get_weather: aiSdkWeatherTool,
      },
      messages: [
        {
          role: 'user',
          content: 'What\'s the weather like in New York?',
        },
      ],
    });

    console.log('✅ Response:');
    console.log(result.text);

    if (result.toolCalls && result.toolCalls.length > 0) {
      console.log('\n🔧 Tool was called successfully!');
      console.log(`Tool calls: ${result.toolCalls.length}`);
      console.log(`Tokens used: ${result.usage?.totalTokens || 'N/A'}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        console.log('\n💡 Make sure your DUDOXX_API_KEY is set in .env.local');
      }
      if (error.message.includes('fetch')) {
        console.log('\n💡 Check your internet connection and DUDOXX_BASE_URL');
      }
    }
  }
}

// Run the example
simpleWeatherExample();