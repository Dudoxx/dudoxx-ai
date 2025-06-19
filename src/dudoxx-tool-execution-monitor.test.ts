import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DudoxxToolExecutionMonitor, ToolExecutionConfig } from './dudoxx-tool-execution-monitor';
import { DudoxxToolError, DudoxxTimeoutError } from './dudoxx-error';

describe('DudoxxToolExecutionMonitor', () => {
  let monitor: DudoxxToolExecutionMonitor;

  beforeEach(() => {
    monitor = new DudoxxToolExecutionMonitor({
      timeoutMs: 1000,
      maxRetries: 2,
      enableMetrics: true,
      enablePerformanceTracking: true,
    });
  });

  describe('executeToolWithMonitoring', () => {
    it('should execute tool successfully', async () => {
      const mockExecute = vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ result: 'success' }), 10))
      );
      
      const result = await monitor.executeToolWithMonitoring(
        'test-tool',
        { input: 'test' },
        mockExecute
      );

      expect(result.result).toEqual({ result: 'success' });
      expect(result.error).toBeUndefined();
      expect(result.metrics.status).toBe('success');
      expect(result.metrics.toolName).toBe('test-tool');
      expect(result.metrics.duration).toBeGreaterThan(0);
      expect(result.warnings).toEqual([]);
    });

    it('should handle tool execution timeout', async () => {
      const mockExecute = vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 2000))
      );
      
      const result = await monitor.executeToolWithMonitoring(
        'slow-tool',
        { input: 'test' },
        mockExecute
      );

      expect(result.result).toBeUndefined();
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error?.message).toContain('timeout');
      expect(result.metrics.status).toBe('error');
      expect(result.warnings.length).toBeGreaterThan(0);
    }, 10000);

    it('should retry on failures', async () => {
      let attemptCount = 0;
      const mockExecute = vi.fn().mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Temporary failure');
        }
        return Promise.resolve({ result: 'success after retries' });
      });
      
      const result = await monitor.executeToolWithMonitoring(
        'retry-tool',
        { input: 'test' },
        mockExecute
      );

      expect(result.result).toEqual({ result: 'success after retries' });
      expect(result.metrics.retryCount).toBe(2);
      expect(result.metrics.status).toBe('success');
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(mockExecute).toHaveBeenCalledTimes(3);
    });

    it('should fail after max retries', async () => {
      const mockExecute = vi.fn().mockRejectedValue(new Error('Persistent failure'));
      
      const result = await monitor.executeToolWithMonitoring(
        'failing-tool',
        { input: 'test' },
        mockExecute
      );

      expect(result.result).toBeUndefined();
      expect(result.error).toBeInstanceOf(Error);
      expect(result.metrics.status).toBe('error');
      expect(result.metrics.retryCount).toBe(2);
      expect(mockExecute).toHaveBeenCalledTimes(3); // initial + 2 retries
    });

    it('should track performance metrics', async () => {
      const mockExecute = vi.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ data: 'test' }), 100))
      );
      
      const result = await monitor.executeToolWithMonitoring(
        'metrics-tool',
        { input: 'test' },
        mockExecute
      );

      expect(result.metrics.memoryUsage).toBeGreaterThanOrEqual(0);
      expect(result.metrics.duration).toBeGreaterThanOrEqual(100);
      expect(result.metrics.startTime).toBeDefined();
      expect(result.metrics.endTime).toBeDefined();
    });
  });

  describe('getExecutionStats', () => {
    it('should return accurate statistics', async () => {
      // Execute successful tool
      await monitor.executeToolWithMonitoring(
        'success-tool',
        {},
        vi.fn().mockResolvedValue('success')
      );

      // Execute failing tool
      await monitor.executeToolWithMonitoring(
        'fail-tool',
        {},
        vi.fn().mockRejectedValue(new Error('failure'))
      );

      const stats = monitor.getExecutionStats();

      expect(stats.totalCompleted).toBe(2);
      expect(stats.successRate).toBe(0.5);
      expect(stats.errorRate).toBe(0.5);
      expect(stats.timeoutRate).toBe(0);
      expect(stats.averageDuration).toBeGreaterThan(0);
    });

    it('should return zero stats when no executions', () => {
      const stats = monitor.getExecutionStats();

      expect(stats.totalCompleted).toBe(0);
      expect(stats.successRate).toBe(0);
      expect(stats.errorRate).toBe(0);
      expect(stats.timeoutRate).toBe(0);
      expect(stats.averageDuration).toBe(0);
    });
  });

  describe('getToolMetrics', () => {
    it('should return metrics for specific tool', async () => {
      await monitor.executeToolWithMonitoring(
        'test-tool',
        {},
        vi.fn().mockResolvedValue('result1')
      );

      await monitor.executeToolWithMonitoring(
        'test-tool',
        {},
        vi.fn().mockResolvedValue('result2')
      );

      await monitor.executeToolWithMonitoring(
        'other-tool',
        {},
        vi.fn().mockResolvedValue('result3')
      );

      const testToolMetrics = monitor.getToolMetrics('test-tool');
      const otherToolMetrics = monitor.getToolMetrics('other-tool');

      expect(testToolMetrics).toHaveLength(2);
      expect(otherToolMetrics).toHaveLength(1);
      expect(testToolMetrics[0].toolName).toBe('test-tool');
      expect(otherToolMetrics[0].toolName).toBe('other-tool');
    });
  });

  describe('configuration management', () => {
    it('should update configuration', () => {
      const newConfig: Partial<ToolExecutionConfig> = {
        timeoutMs: 5000,
        maxRetries: 5,
      };

      monitor.updateConfig(newConfig);
      const config = monitor.getConfig();

      expect(config.timeoutMs).toBe(5000);
      expect(config.maxRetries).toBe(5);
      expect(config.enableMetrics).toBe(true); // Should preserve existing values
    });

    it('should clear metrics', async () => {
      await monitor.executeToolWithMonitoring(
        'test-tool',
        {},
        vi.fn().mockResolvedValue('success')
      );

      expect(monitor.getExecutionStats().totalCompleted).toBe(1);

      monitor.clearMetrics();

      expect(monitor.getExecutionStats().totalCompleted).toBe(0);
    });
  });

  describe('error handling', () => {
    it('should handle DudoxxToolError correctly', async () => {
      const toolError = new DudoxxToolError('Tool failed', 'test-tool');
      const mockExecute = vi.fn().mockRejectedValue(toolError);
      
      const result = await monitor.executeToolWithMonitoring(
        'error-tool',
        {},
        mockExecute
      );

      expect(result.error).toBeInstanceOf(DudoxxToolError);
      expect(result.metrics.status).toBe('error');
    });

    it('should handle timeout errors correctly', async () => {
      const timeoutError = new DudoxxTimeoutError('Operation timed out', 1000);
      const mockExecute = vi.fn().mockRejectedValue(timeoutError);
      
      const result = await monitor.executeToolWithMonitoring(
        'timeout-tool',
        {},
        mockExecute
      );

      expect(result.error).toBeInstanceOf(DudoxxTimeoutError);
      expect(result.metrics.status).toBe('error');
    });
  });

  describe('execution ID generation', () => {
    it('should generate unique execution IDs', async () => {
      const ids = new Set<string>();
      
      for (let i = 0; i < 10; i++) {
        const result = await monitor.executeToolWithMonitoring(
          'unique-tool',
          {},
          vi.fn().mockResolvedValue('success')
        );
        ids.add(result.metrics.executionId);
      }

      expect(ids.size).toBe(10); // All IDs should be unique
    });
  });
});