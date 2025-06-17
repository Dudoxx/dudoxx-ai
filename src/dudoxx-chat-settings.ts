// DUDOXX Chat Models based on environment configuration
export type DudoxxChatModelId =
  // Standard models
  | 'dudoxx'
  | 'dudoxx-reasoning'
  // Allow custom model names
  | (string & {});

export interface DudoxxChatSettings {
  /**
   * Temperature for the model. Controls randomness.
   * Range: 0.0 to 2.0
   * Default: 0.7
   */
  temperature?: number;

  /**
   * Top-p sampling. Controls diversity via nucleus sampling.
   * Range: 0.0 to 1.0
   * Default: 1.0
   */
  topP?: number;

  /**
   * Frequency penalty. Reduces repetition.
   * Range: -2.0 to 2.0
   * Default: 0.0
   */
  frequencyPenalty?: number;

  /**
   * Presence penalty. Encourages new topics.
   * Range: -2.0 to 2.0
   * Default: 0.0
   */
  presencePenalty?: number;

  /**
   * Reasoning effort level for dudoxx-reasoning model.
   * NOTE: Currently not supported by DUDOXX API
   * @deprecated This parameter is not yet supported
   */
  reasoningEffort?: 'low' | 'medium' | 'high';

  /**
   * Custom DUDOXX-specific parameters
   */
  dudoxxParams?: {
    /**
     * Enable enhanced reasoning mode
     */
    enableReasoning?: boolean;
    
    /**
     * Custom reasoning parameters
     */
    reasoningParams?: Record<string, unknown>;
  };
}