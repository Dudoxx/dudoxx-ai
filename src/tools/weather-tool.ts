import { z } from 'zod';

/**
 * Mock weather data for demonstration purposes
 */
const MOCK_WEATHER_DATA = {
  'new york': {
    temperature: 22,
    condition: 'Partly Cloudy',
    humidity: 65,
    windSpeed: 8,
    description: 'A pleasant day with some clouds and mild temperatures',
  },
  'london': {
    temperature: 15,
    condition: 'Rainy',
    humidity: 85,
    windSpeed: 12,
    description: 'Typical London weather with light rain and cool temperatures',
  },
  'tokyo': {
    temperature: 28,
    condition: 'Sunny',
    humidity: 70,
    windSpeed: 5,
    description: 'Clear skies with warm temperatures and gentle breeze',
  },
  'paris': {
    temperature: 18,
    condition: 'Overcast',
    humidity: 75,
    windSpeed: 6,
    description: 'Cloudy skies with comfortable temperatures',
  },
  'sydney': {
    temperature: 25,
    condition: 'Clear',
    humidity: 60,
    windSpeed: 10,
    description: 'Beautiful clear day with perfect temperatures',
  },
  'berlin': {
    temperature: 16,
    condition: 'Windy',
    humidity: 55,
    windSpeed: 15,
    description: 'Breezy day with cool temperatures and clear skies',
  },
  'toronto': {
    temperature: 20,
    condition: 'Partly Cloudy',
    humidity: 68,
    windSpeed: 7,
    description: 'Mix of sun and clouds with pleasant temperatures',
  },
  'dubai': {
    temperature: 35,
    condition: 'Hot',
    humidity: 45,
    windSpeed: 3,
    description: 'Very hot and dry with minimal wind',
  },
};

/**
 * Weather tool parameter schema
 */
export const weatherToolSchema = z.object({
  location: z.string().describe('The city or location to get weather for'),
  units: z.enum(['celsius', 'fahrenheit']).optional().default('celsius').describe('Temperature units'),
});

export type WeatherToolParams = z.infer<typeof weatherToolSchema>;

/**
 * Weather information interface
 */
export interface WeatherInfo {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  description: string;
  units: 'celsius' | 'fahrenheit';
  timestamp: string;
}

/**
 * Convert Celsius to Fahrenheit
 */
function celsiusToFahrenheit(celsius: number): number {
  return Math.round((celsius * 9/5) + 32);
}

/**
 * Mock weather tool implementation
 * This simulates calling a weather API but returns mock data for demonstration
 */
export async function getWeather(params: WeatherToolParams): Promise<WeatherInfo> {
  const { location, units = 'celsius' } = params;
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 400));
  
  // Normalize location for lookup
  const normalizedLocation = location.toLowerCase().trim();
  
  // Get weather data (fallback to random data if location not found)
  let weatherData = MOCK_WEATHER_DATA[normalizedLocation as keyof typeof MOCK_WEATHER_DATA];
  
  if (!weatherData) {
    // Generate random weather data for unknown locations
    const conditions = ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rainy', 'Windy', 'Clear'];
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    
    weatherData = {
      temperature: Math.round(10 + Math.random() * 25), // 10-35°C
      condition: randomCondition,
      humidity: Math.round(40 + Math.random() * 40), // 40-80%
      windSpeed: Math.round(2 + Math.random() * 15), // 2-17 km/h
      description: `${randomCondition} weather with moderate conditions`,
    };
  }
  
  // Convert temperature if needed
  const temperature = units === 'fahrenheit' 
    ? celsiusToFahrenheit(weatherData.temperature)
    : weatherData.temperature;
  
  return {
    location: location,
    temperature,
    condition: weatherData.condition,
    humidity: weatherData.humidity,
    windSpeed: weatherData.windSpeed,
    description: weatherData.description,
    units,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Tool definition for AI SDK integration
 */
export const weatherTool = {
  name: 'get_weather',
  description: 'Get current weather information for a specified location',
  parameters: weatherToolSchema,
  execute: async (params: WeatherToolParams) => {
    try {
      const weather = await getWeather(params);
      return {
        success: true,
        data: weather,
        message: `Weather in ${weather.location}: ${weather.temperature}°${weather.units === 'celsius' ? 'C' : 'F'}, ${weather.condition}. ${weather.description}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: `Failed to get weather information for ${params.location}`,
      };
    }
  },
};

/**
 * Utility function to format weather information
 */
export function formatWeatherInfo(weather: WeatherInfo): string {
  const tempUnit = weather.units === 'celsius' ? '°C' : '°F';
  
  return `
🌤️ Weather in ${weather.location}:
🌡️ Temperature: ${weather.temperature}${tempUnit}
☁️ Condition: ${weather.condition}
💧 Humidity: ${weather.humidity}%
💨 Wind Speed: ${weather.windSpeed} km/h
📝 Description: ${weather.description}
🕒 Last Updated: ${new Date(weather.timestamp).toLocaleString()}
  `.trim();
}

/**
 * Export for easy integration with AI SDK tools
 */
export const aiSdkWeatherTool = {
  description: weatherTool.description,
  parameters: weatherToolSchema,
  execute: weatherTool.execute,
};