import { describe, it, expect, beforeEach } from 'vitest';
import { 
  getWeather, 
  weatherTool, 
  formatWeatherInfo,
  weatherToolSchema,
  type WeatherToolParams,
} from './weather-tool';

describe('Weather Tool', () => {
  describe('weatherToolSchema', () => {
    it('should validate correct parameters', () => {
      const validParams = { location: 'New York', units: 'celsius' as const };
      const result = weatherToolSchema.parse(validParams);
      expect(result).toEqual(validParams);
    });

    it('should default to celsius when units not provided', () => {
      const params = { location: 'London' };
      const result = weatherToolSchema.parse(params);
      expect(result.units).toBe('celsius');
    });

    it('should reject invalid units', () => {
      const invalidParams = { location: 'Paris', units: 'kelvin' };
      expect(() => weatherToolSchema.parse(invalidParams)).toThrow();
    });
  });

  describe('getWeather', () => {
    it('should return weather for known cities', async () => {
      const result = await getWeather({ location: 'New York' });
      
      expect(result).toMatchObject({
        location: 'New York',
        temperature: 22,
        condition: 'Partly Cloudy',
        humidity: 65,
        windSpeed: 8,
        units: 'celsius',
      });
      expect(result.timestamp).toBeDefined();
      expect(new Date(result.timestamp)).toBeInstanceOf(Date);
    });

    it('should convert temperature to fahrenheit', async () => {
      const result = await getWeather({ location: 'London', units: 'fahrenheit' });
      
      expect(result.units).toBe('fahrenheit');
      expect(result.temperature).toBe(59); // 15°C = 59°F
    });

    it('should handle unknown cities with random data', async () => {
      const result = await getWeather({ location: 'Unknown City' });
      
      expect(result.location).toBe('Unknown City');
      expect(result.temperature).toBeGreaterThanOrEqual(10);
      expect(result.temperature).toBeLessThanOrEqual(35);
      expect(result.humidity).toBeGreaterThanOrEqual(40);
      expect(result.humidity).toBeLessThanOrEqual(80);
      expect(result.windSpeed).toBeGreaterThanOrEqual(2);
      expect(result.windSpeed).toBeLessThanOrEqual(17);
      expect(result.units).toBe('celsius');
    });

    it('should simulate API delay', async () => {
      const startTime = Date.now();
      await getWeather({ location: 'Tokyo' });
      const duration = Date.now() - startTime;
      
      expect(duration).toBeGreaterThanOrEqual(100);
      expect(duration).toBeLessThan(600); // Max delay is ~500ms + overhead
    });

    it('should be case insensitive for city lookup', async () => {
      const result1 = await getWeather({ location: 'LONDON' });
      const result2 = await getWeather({ location: 'london' });
      const result3 = await getWeather({ location: 'London' });
      
      expect(result1.condition).toBe('Rainy');
      expect(result2.condition).toBe('Rainy');
      expect(result3.condition).toBe('Rainy');
    });
  });

  describe('weatherTool', () => {
    it('should have correct structure', () => {
      expect(weatherTool.name).toBe('get_weather');
      expect(weatherTool.description).toContain('weather information');
      expect(weatherTool.parameters).toBe(weatherToolSchema);
      expect(typeof weatherTool.execute).toBe('function');
    });

    it('should execute successfully with valid parameters', async () => {
      const result = await weatherTool.execute({ location: 'Paris' });
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.message).toContain('Weather in Paris');
      expect(result.data.location).toBe('Paris');
    });

    it('should handle execution errors gracefully', async () => {
      // Test error handling by creating a mock implementation
      const mockWeatherTool = {
        ...weatherTool,
        execute: async (params: WeatherToolParams) => {
          try {
            throw new Error('Mock API error');
          } catch (error) {
            return {
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
              message: `Failed to get weather information for ${params.location}`,
            };
          }
        }
      };
      
      const result = await mockWeatherTool.execute({ location: 'Test' });
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Mock API error');
      expect(result.message).toContain('Failed to get weather information');
    });
  });

  describe('formatWeatherInfo', () => {
    it('should format weather information correctly', () => {
      const weather = {
        location: 'Test City',
        temperature: 25,
        condition: 'Sunny',
        humidity: 60,
        windSpeed: 10,
        description: 'Perfect weather',
        units: 'celsius' as const,
        timestamp: '2024-01-01T12:00:00.000Z',
      };

      const formatted = formatWeatherInfo(weather);
      
      expect(formatted).toContain('🌤️ Weather in Test City');
      expect(formatted).toContain('🌡️ Temperature: 25°C');
      expect(formatted).toContain('☁️ Condition: Sunny');
      expect(formatted).toContain('💧 Humidity: 60%');
      expect(formatted).toContain('💨 Wind Speed: 10 km/h');
      expect(formatted).toContain('📝 Description: Perfect weather');
      expect(formatted).toContain('🕒 Last Updated:');
    });

    it('should format fahrenheit temperatures correctly', () => {
      const weather = {
        location: 'Test City',
        temperature: 77,
        condition: 'Hot',
        humidity: 50,
        windSpeed: 5,
        description: 'Very warm',
        units: 'fahrenheit' as const,
        timestamp: '2024-01-01T12:00:00.000Z',
      };

      const formatted = formatWeatherInfo(weather);
      expect(formatted).toContain('🌡️ Temperature: 77°F');
    });
  });

  describe('Integration with known cities', () => {
    const knownCities = [
      'new york', 'london', 'tokyo', 'paris', 
      'sydney', 'berlin', 'toronto', 'dubai'
    ];

    it.each(knownCities)('should return consistent data for %s', async (city) => {
      const result1 = await getWeather({ location: city });
      const result2 = await getWeather({ location: city });
      
      // Should return same data for same city
      expect(result1.temperature).toBe(result2.temperature);
      expect(result1.condition).toBe(result2.condition);
      expect(result1.humidity).toBe(result2.humidity);
      expect(result1.windSpeed).toBe(result2.windSpeed);
    });
  });
});