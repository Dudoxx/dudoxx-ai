export interface DudoxxResponseMetadata {
  id?: string;
  modelId?: string;
  timestamp?: Date;
  processingTimeMs?: number;
  toolCallsCount?: number;
  streamingEnabled?: boolean;
  retryCount?: number;
  errorCount?: number;
}

export function getResponseMetadata(
  response: {
    id?: string | null;
    model?: string | null;
    created?: number | null;
  },
  options?: {
    startTime?: number;
    toolCallsCount?: number;
    isStreaming?: boolean;
    retryCount?: number;
    errorCount?: number;
  }
): DudoxxResponseMetadata {
  const metadata: DudoxxResponseMetadata = {
    id: response.id ?? undefined,
    modelId: response.model ?? undefined,
    timestamp: response.created != null ? new Date(response.created * 1000) : undefined,
  };

  if (options) {
    if (options.startTime) {
      metadata.processingTimeMs = Date.now() - options.startTime;
    }
    
    if (options.toolCallsCount !== undefined) {
      metadata.toolCallsCount = options.toolCallsCount;
    }
    
    if (options.isStreaming !== undefined) {
      metadata.streamingEnabled = options.isStreaming;
    }
    
    if (options.retryCount !== undefined) {
      metadata.retryCount = options.retryCount;
    }
    
    if (options.errorCount !== undefined) {
      metadata.errorCount = options.errorCount;
    }
  }

  return metadata;
}

/**
 * Enhanced streaming response metadata with performance tracking
 */
export function getStreamingMetadata(
  response: any,
  streamingStats?: {
    chunksReceived: number;
    bytesReceived: number;
    streamStartTime: number;
    firstChunkTime?: number;
    lastChunkTime?: number;
  }
): DudoxxResponseMetadata & {
  streaming?: {
    chunksReceived: number;
    bytesReceived: number;
    streamDurationMs: number;
    timeToFirstChunk?: number;
    averageChunkSize?: number;
    throughputBytesPerSecond?: number;
  };
} {
  const baseMetadata = getResponseMetadata(response, { isStreaming: true });

  if (!streamingStats) {
    return baseMetadata;
  }

  const streamDurationMs = Date.now() - streamingStats.streamStartTime;
  const timeToFirstChunk = streamingStats.firstChunkTime 
    ? streamingStats.firstChunkTime - streamingStats.streamStartTime 
    : undefined;

  return {
    ...baseMetadata,
    streaming: {
      chunksReceived: streamingStats.chunksReceived,
      bytesReceived: streamingStats.bytesReceived,
      streamDurationMs,
      timeToFirstChunk,
      averageChunkSize: streamingStats.chunksReceived > 0 
        ? streamingStats.bytesReceived / streamingStats.chunksReceived 
        : 0,
      throughputBytesPerSecond: streamDurationMs > 0 
        ? (streamingStats.bytesReceived / streamDurationMs) * 1000 
        : 0,
    },
  };
}