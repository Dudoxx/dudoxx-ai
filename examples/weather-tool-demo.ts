#!/usr/bin/env tsx

/**
 * DUDOXX-AI Weather Tool Demo
 * 
 * This example demonstrates how to use the mock weather tool with DUDOXX-AI provider
 * using environment variables from .env.local
 */

import dotenv from 'dotenv';
import path from 'path';
import { generateText, streamText } from 'ai';
import { 
  dudoxx, 
  aiSdkWeatherTool, 
  formatWeatherInfo,
  type WeatherInfo 
} from '../src/index';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Validate required environment variables
function validateEnvironment() {
  const required = ['DUDOXX_API_KEY', 'DUDOXX_BASE_URL', 'DUDOXX_MODEL_NAME'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

/**
 * Basic weather tool demonstration
 */
async function basicWeatherDemo() {
  console.log('🌤️ Basic Weather Tool Demo');
  console.log('=' .repeat(40));

  try {
    const result = await generateText({
      model: dudoxx(process.env.DUDOXX_MODEL_NAME!, {
        temperature: 0.7,
      }),
      tools: {
        get_weather: aiSdkWeatherTool,
      },
      maxTokens: 500,
      messages: [
        {
          role: 'user',
          content: 'What\'s the weather like in New York and London? Please get current conditions for both cities.',
        },
      ],
    });

    console.log('✅ Assistant Response:');
    console.log(result.text);

    if (result.toolCalls?.length) {
      console.log('\n🔧 Tool Calls Made:');
      result.toolCalls.forEach((call, index) => {
        console.log(`${index + 1}. ${call.toolName}: ${call.args}`);
      });

      console.log('\n📊 Tool Results:');
      result.toolResults?.forEach((result, index) => {
        if (result.result?.success) {
          const weather = result.result.data as WeatherInfo;
          console.log(`${index + 1}. ${formatWeatherInfo(weather)}`);
        }
      });
    }

  } catch (error) {
    console.error('❌ Error in basic demo:', error);
  }
}

/**
 * Streaming weather tool demonstration
 */
async function streamingWeatherDemo() {
  console.log('\n🌊 Streaming Weather Tool Demo');
  console.log('=' .repeat(40));

  try {
    const result = await streamText({
      model: dudoxx(process.env.DUDOXX_MODEL_NAME!, {
        temperature: 0.8,
      }),
      tools: {
        get_weather: aiSdkWeatherTool,
      },
      maxTokens: 600,
      messages: [
        {
          role: 'user',
          content: 'I\'m planning a trip to Tokyo, Paris, and Sydney. Can you get the weather for all three cities and recommend what I should pack?',
        },
      ],
    });

    console.log('🔄 Streaming response...\n');

    for await (const delta of result.textStream) {
      process.stdout.write(delta);
    }

    console.log('\n\n🔧 Tool Usage Summary:');
    const finalResult = await result.response;
    
    if (finalResult.toolCalls?.length) {
      finalResult.toolCalls.forEach((call, index) => {
        console.log(`${index + 1}. Tool: ${call.toolName}`);
        console.log(`   Args: ${call.args}`);
      });
    }

  } catch (error) {
    console.error('❌ Error in streaming demo:', error);
  }
}

/**
 * Weather comparison demonstration
 */
async function weatherComparisonDemo() {
  console.log('\n📊 Weather Comparison Demo');
  console.log('=' .repeat(40));

  try {
    const result = await generateText({
      model: dudoxx(process.env.DUDOXX_MODEL_NAME!, {
        temperature: 0.6,
      }),
      tools: {
        get_weather: aiSdkWeatherTool,
      },
      maxTokens: 800,
      messages: [
        {
          role: 'user',
          content: 'Compare the weather in Dubai, Berlin, and Toronto. Which city has the best weather today for outdoor activities?',
        },
      ],
    });

    console.log('🎯 Weather Comparison Result:');
    console.log(result.text);

    // Display usage statistics
    console.log('\n📈 Usage Statistics:');
    console.log(`- Prompt tokens: ${result.usage?.promptTokens || 0}`);
    console.log(`- Completion tokens: ${result.usage?.completionTokens || 0}`);
    console.log(`- Total tokens: ${result.usage?.totalTokens || 0}`);
    console.log(`- Tool calls: ${result.toolCalls?.length || 0}`);

  } catch (error) {
    console.error('❌ Error in comparison demo:', error);
  }
}

/**
 * Error handling demonstration
 */
async function errorHandlingDemo() {
  console.log('\n🛡️ Error Handling Demo');
  console.log('=' .repeat(40));

  try {
    const result = await generateText({
      model: dudoxx(process.env.DUDOXX_MODEL_NAME!, {
        temperature: 0.5,
      }),
      tools: {
        get_weather: aiSdkWeatherTool,
      },
      maxTokens: 400,
      messages: [
        {
          role: 'user',
          content: 'Get weather for an invalid location like "XYZ123" and see how the system handles it.',
        },
      ],
    });

    console.log('🔍 Error Handling Result:');
    console.log(result.text);

  } catch (error) {
    console.error('❌ Error in error handling demo:', error);
  }
}

/**
 * Main demo runner
 */
async function runWeatherToolDemo() {
  console.log('🚀 DUDOXX-AI Weather Tool Demo');
  console.log('=' .repeat(50));
  
  try {
    validateEnvironment();
    
    console.log('✅ Environment validated');
    console.log(`🔗 DUDOXX API: ${process.env.DUDOXX_BASE_URL}`);
    console.log(`🤖 Model: ${process.env.DUDOXX_MODEL_NAME}`);
    console.log('');

    // Run all demos
    await basicWeatherDemo();
    await streamingWeatherDemo();
    await weatherComparisonDemo();
    await errorHandlingDemo();

    console.log('\n🎉 All demos completed successfully!');
    console.log('\n💡 Try running this script to see the weather tool in action:');
    console.log('   tsx examples/weather-tool-demo.ts');

  } catch (error) {
    console.error('💥 Demo failed:', error);
    process.exit(1);
  }
}

// Run the demo if this file is executed directly
if (require.main === module) {
  runWeatherToolDemo().catch(console.error);
}

export {
  runWeatherToolDemo,
  basicWeatherDemo,
  streamingWeatherDemo,
  weatherComparisonDemo,
  errorHandlingDemo,
};