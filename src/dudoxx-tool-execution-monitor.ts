import { LanguageModelV1CallWarning } from '@ai-sdk/provider';

export interface ToolExecutionMetrics {
  toolName: string;
  executionId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'pending' | 'success' | 'error' | 'timeout';
  error?: Error;
  retryCount: number;
  memoryUsage?: number;
  args?: any;
  result?: any;
}

export interface ToolExecutionConfig {
  timeoutMs: number;
  maxRetries: number;
  retryDelayMs: number;
  enableMetrics: boolean;
  enablePerformanceTracking: boolean;
}

export class DudoxxToolExecutionMonitor {
  private activeExecutions = new Map<string, ToolExecutionMetrics>();
  private completedExecutions: ToolExecutionMetrics[] = [];
  private config: ToolExecutionConfig;

  constructor(config: Partial<ToolExecutionConfig> = {}) {
    this.config = {
      timeoutMs: 30000, // 30 seconds default
      maxRetries: 3,
      retryDelayMs: 1000,
      enableMetrics: true,
      enablePerformanceTracking: true,
      ...config,
    };
  }

  /**
   * Execute a tool with timeout and retry protection
   */
  async executeToolWithMonitoring<T>(
    toolName: string,
    args: any,
    executeFunction: (args: any) => Promise<T>,
  ): Promise<{
    result?: T;
    error?: Error;
    metrics: ToolExecutionMetrics;
    warnings: LanguageModelV1CallWarning[];
  }> {
    const executionId = this.generateExecutionId(toolName);
    const warnings: LanguageModelV1CallWarning[] = [];
    
    const metrics: ToolExecutionMetrics = {
      toolName,
      executionId,
      startTime: Date.now(),
      status: 'pending',
      retryCount: 0,
      args: this.config.enableMetrics ? args : undefined,
    };

    this.activeExecutions.set(executionId, metrics);

    try {
      // Add performance tracking
      if (this.config.enablePerformanceTracking) {
        metrics.memoryUsage = this.getMemoryUsage();
      }

      const result = await this.executeWithTimeoutAndRetry(
        executeFunction,
        args,
        metrics,
        warnings,
      );

      metrics.status = 'success';
      metrics.endTime = Date.now();
      metrics.duration = metrics.endTime - metrics.startTime;
      metrics.result = this.config.enableMetrics ? result : undefined;

      this.completeExecution(executionId, metrics);

      return { result, metrics, warnings };
    } catch (error) {
      metrics.status = 'error';
      metrics.endTime = Date.now();
      metrics.duration = metrics.endTime - metrics.startTime;
      metrics.error = error as Error;

      this.completeExecution(executionId, metrics);

      warnings.push({
        type: 'other',
        message: `Tool execution failed: ${toolName} - ${(error as Error).message}`,
      });

      return { error: error as Error, metrics, warnings };
    }
  }

  private async executeWithTimeoutAndRetry<T>(
    executeFunction: (args: any) => Promise<T>,
    args: any,
    metrics: ToolExecutionMetrics,
    warnings: LanguageModelV1CallWarning[],
  ): Promise<T> {
    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      metrics.retryCount = attempt;

      try {
        const result = await Promise.race([
          executeFunction(args),
          this.createTimeoutPromise<T>(this.config.timeoutMs),
        ]);

        if (attempt > 0) {
          warnings.push({
            type: 'other',
            message: `Tool ${metrics.toolName} succeeded after ${attempt} retries`,
          });
        }

        return result;
      } catch (error) {
        const isTimeout = (error as Error).message.includes('timeout');
        const isLastAttempt = attempt === this.config.maxRetries;

        if (isTimeout) {
          metrics.status = 'timeout';
          warnings.push({
            type: 'other',
            message: `Tool ${metrics.toolName} execution timeout (${this.config.timeoutMs}ms)`,
          });
        }

        if (isLastAttempt) {
          throw error;
        }

        // Exponential backoff for retries
        const delay = this.config.retryDelayMs * Math.pow(2, attempt);
        await this.sleep(delay);

        warnings.push({
          type: 'other',
          message: `Tool ${metrics.toolName} retry ${attempt + 1}/${this.config.maxRetries} after ${delay}ms delay`,
        });
      }
    }

    throw new Error(`Tool execution failed after ${this.config.maxRetries} retries`);
  }

  private createTimeoutPromise<T>(timeoutMs: number): Promise<T> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Tool execution timeout after ${timeoutMs}ms`));
      }, timeoutMs);
    });
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateExecutionId(toolName: string): string {
    return `${toolName}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  private getMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    }
    return 0;
  }

  private completeExecution(executionId: string, metrics: ToolExecutionMetrics): void {
    this.activeExecutions.delete(executionId);
    
    if (this.config.enableMetrics) {
      this.completedExecutions.push({ ...metrics });
      
      // Keep only last 1000 executions to prevent memory leaks
      if (this.completedExecutions.length > 1000) {
        this.completedExecutions = this.completedExecutions.slice(-1000);
      }
    }
  }

  /**
   * Get current execution statistics
   */
  getExecutionStats(): {
    activeCount: number;
    totalCompleted: number;
    successRate: number;
    averageDuration: number;
    timeoutRate: number;
    errorRate: number;
  } {
    const total = this.completedExecutions.length;
    if (total === 0) {
      return {
        activeCount: this.activeExecutions.size,
        totalCompleted: 0,
        successRate: 0,
        averageDuration: 0,
        timeoutRate: 0,
        errorRate: 0,
      };
    }

    const successful = this.completedExecutions.filter(e => e.status === 'success').length;
    const timeouts = this.completedExecutions.filter(e => e.status === 'timeout').length;
    const errors = this.completedExecutions.filter(e => e.status === 'error').length;
    
    const durations = this.completedExecutions
      .filter(e => e.duration !== undefined)
      .map(e => e.duration!);
    
    const averageDuration = durations.length > 0 
      ? durations.reduce((sum, d) => sum + d, 0) / durations.length 
      : 0;

    return {
      activeCount: this.activeExecutions.size,
      totalCompleted: total,
      successRate: successful / total,
      averageDuration,
      timeoutRate: timeouts / total,
      errorRate: errors / total,
    };
  }

  /**
   * Get detailed metrics for a specific tool
   */
  getToolMetrics(toolName: string): ToolExecutionMetrics[] {
    return this.completedExecutions.filter(e => e.toolName === toolName);
  }

  /**
   * Clear metrics history
   */
  clearMetrics(): void {
    this.completedExecutions = [];
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<ToolExecutionConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): ToolExecutionConfig {
    return { ...this.config };
  }
}

// Global monitor instance
export const globalToolMonitor = new DudoxxToolExecutionMonitor();