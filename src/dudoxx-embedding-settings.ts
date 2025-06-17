// DUDOXX Embedding Models
export type DudoxxEmbeddingModelId =
  // Standard embedding model
  | 'embedder'
  // Allow custom model names
  | (string & {});

export interface DudoxxEmbeddingSettings {
  /**
   * Maximum number of embeddings to process in a single call.
   * Default: 32
   */
  maxEmbeddingsPerCall?: number;

  /**
   * Whether to support parallel calls.
   * Default: true (DUDOXX supports parallel processing)
   */
  supportsParallelCalls?: boolean;

  /**
   * Number of dimensions for the embedding vectors.
   * If not specified, uses the model's default.
   */
  dimensions?: number;

  /**
   * Encoding format for the embeddings.
   * Default: 'float'
   */
  encodingFormat?: 'float' | 'base64';

  /**
   * Custom DUDOXX-specific embedding parameters
   */
  dudoxxParams?: {
    /**
     * Custom preprocessing options
     */
    preprocessing?: Record<string, unknown>;
    
    /**
     * Model-specific configuration
     */
    modelConfig?: Record<string, unknown>;
  };
}