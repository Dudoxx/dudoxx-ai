#!/usr/bin/env tsx

/**
 * Standalone Weather Tool Test
 * Tests the weather tool directly without AI SDK integration
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getWeather, weatherTool, formatWeatherInfo } from '../src/tools/weather-tool';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.local') });

async function testWeatherToolDirectly() {
  console.log('🧪 Testing Weather Tool Directly\n');

  // Test 1: Basic weather fetch
  console.log('1️⃣ Testing basic weather fetch...');
  try {
    const weather = await getWeather({ location: 'New York' });
    console.log('✅ Success!');
    console.log(formatWeatherInfo(weather));
  } catch (error) {
    console.error('❌ Error:', error);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Test with fahrenheit
  console.log('2️⃣ Testing with fahrenheit...');
  try {
    const weather = await getWeather({ location: 'London', units: 'fahrenheit' });
    console.log('✅ Success!');
    console.log(formatWeatherInfo(weather));
  } catch (error) {
    console.error('❌ Error:', error);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: Test unknown city
  console.log('3️⃣ Testing unknown city...');
  try {
    const weather = await getWeather({ location: 'Atlantis' });
    console.log('✅ Success!');
    console.log(formatWeatherInfo(weather));
  } catch (error) {
    console.error('❌ Error:', error);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 4: Test weather tool execute function
  console.log('4️⃣ Testing weather tool execute...');
  try {
    const result = await weatherTool.execute({ location: 'Tokyo' });
    console.log('✅ Success!');
    console.log('Tool result:', result);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testWeatherToolDirectly();