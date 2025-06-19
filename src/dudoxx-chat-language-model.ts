import {
  LanguageModelV1,
  LanguageModelV1CallWarning,
  LanguageModelV1FinishReason,
  LanguageModelV1StreamPart,
} from '@ai-sdk/provider';
import {
  FetchFunction,
  ParseResult,
  combineHeaders,
  createEventSourceResponseHandler,
  createJsonResponseHandler,
  postJsonToApi,
} from '@ai-sdk/provider-utils';
import { z } from 'zod';
import { convertToDudoxxChatMessages } from './convert-to-dudoxx-chat-messages';
import { mapDudoxxFinishReason } from './map-dudoxx-finish-reason';
import {
  DudoxxChatModelId,
  DudoxxChatSettings,
} from './dudoxx-chat-settings';
import { dudoxxFailedResponseHandler } from './dudoxx-error';
import { getResponseMetadata } from './get-response-metadata';
import { prepareTools } from './dudoxx-prepare-tools';

type DudoxxChatConfig = {
  provider: string;
  baseURL: string;
  headers: () => Record<string, string | undefined>;
  fetch?: FetchFunction;
};

export class DudoxxChatLanguageModel implements LanguageModelV1 {
  readonly specificationVersion = 'v1';
  readonly defaultObjectGenerationMode = 'json';
  readonly supportsImageUrls = true;

  readonly modelId: DudoxxChatModelId;
  readonly settings: DudoxxChatSettings;

  private readonly config: DudoxxChatConfig;

  constructor(
    modelId: DudoxxChatModelId,
    settings: DudoxxChatSettings,
    config: DudoxxChatConfig,
  ) {
    this.modelId = modelId;
    this.settings = settings;
    this.config = config;
  }

  get provider(): string {
    return this.config.provider;
  }

  supportsUrl(url: URL): boolean {
    return url.protocol === 'https:';
  }

  private getArgs({
    mode,
    prompt,
    maxTokens,
    temperature,
    topP,
    topK,
    frequencyPenalty,
    presencePenalty,
    stopSequences,
    responseFormat,
    seed,
    providerMetadata,
  }: Parameters<LanguageModelV1['doGenerate']>[0]) {
    const type = mode.type;

    const warnings: LanguageModelV1CallWarning[] = [];

    if (topK != null) {
      warnings.push({
        type: 'unsupported-setting',
        setting: 'topK',
      });
    }

    const baseArgs = {
      // model id:
      model: this.modelId,

      // model specific settings:
      // Note: reasoning_effort is not yet supported by DUDOXX API
      // ...(this.settings.reasoningEffort &&
      //   this.modelId.includes('reasoning') && {
      //     reasoning_effort: this.settings.reasoningEffort,
      //   }),

      // standardized settings:
      max_tokens: maxTokens,
      temperature: temperature ?? this.settings.temperature,
      top_p: topP ?? this.settings.topP,
      frequency_penalty: frequencyPenalty ?? this.settings.frequencyPenalty,
      presence_penalty: presencePenalty ?? this.settings.presencePenalty,
      stop: stopSequences,
      seed,

      // response format:
      response_format:
        responseFormat?.type === 'json' ? { type: 'json_object' } : undefined,

      // DUDOXX-specific provider options:
      ...(this.settings.dudoxxParams && this.settings.dudoxxParams),
      ...(providerMetadata?.dudoxx && providerMetadata.dudoxx),

      // messages:
      messages: convertToDudoxxChatMessages(prompt),
    };

    switch (type) {
      case 'regular': {
        const { tools, tool_choice, toolWarnings } = prepareTools(mode);

        return {
          args: { ...baseArgs, tools, tool_choice },
          warnings: [...warnings, ...toolWarnings],
        };
      }

      case 'object-json': {
        return {
          args: {
            ...baseArgs,
            response_format: { type: 'json_object' },
          },
          warnings,
        };
      }

      case 'object-tool': {
        return {
          args: {
            ...baseArgs,
            tool_choice: {
              type: 'function',
              function: { name: mode.tool.name },
            },
            tools: [{ type: 'function', function: mode.tool }],
          },
          warnings,
        };
      }

      default: {
        const _exhaustiveCheck: never = type;
        throw new Error(`Unsupported type: ${_exhaustiveCheck}`);
      }
    }
  }

  async doGenerate(
    options: Parameters<LanguageModelV1['doGenerate']>[0],
  ): Promise<Awaited<ReturnType<LanguageModelV1['doGenerate']>>> {
    const { args, warnings } = this.getArgs(options);

    const {
      responseHeaders,
      value: response,
      rawValue: rawResponse,
    } = await postJsonToApi({
      url: `${this.config.baseURL}/chat/completions`,
      headers: combineHeaders(this.config.headers(), options.headers),
      body: args,
      failedResponseHandler: dudoxxFailedResponseHandler,
      successfulResponseHandler: createJsonResponseHandler(
        dudoxxChatResponseSchema,
      ),
      abortSignal: options.abortSignal,
      fetch: this.config.fetch,
    });

    const { messages: rawPrompt, ...rawSettings } = args;
    const choice = response.choices[0];

    return {
      text: choice.message.content || '',
      toolCalls: choice.message.tool_calls?.map(toolCall => {
        // Generate tool call ID if missing (DUDOXX fix)
        const toolCallId = toolCall.id || `call_${Date.now()}_${Math.random().toString(36).substring(2, 11)}_${toolCall.function.name.substring(0, 8)}`;
        
        // Validate tool call structure
        if (!toolCall.function?.name || typeof toolCall.function.name !== 'string') {
          console.warn('Invalid tool call: missing or invalid function name', toolCall);
          return null;
        }

        // Validate arguments JSON
        let validatedArgs = toolCall.function.arguments || '{}';
        try {
          JSON.parse(validatedArgs);
        } catch (error) {
          console.warn('Invalid tool call arguments JSON, using empty object:', validatedArgs, error);
          validatedArgs = '{}';
        }

        return {
          toolCallType: 'function' as const,
          toolCallId,
          toolName: toolCall.function.name,
          args: validatedArgs,
        };
      }).filter((toolCall): toolCall is NonNullable<typeof toolCall> => toolCall !== null),
      finishReason: mapDudoxxFinishReason(choice.finish_reason),
      usage: {
        promptTokens: response.usage?.prompt_tokens ?? 0,
        completionTokens: response.usage?.completion_tokens ?? 0,
      },
      rawCall: { rawPrompt, rawSettings },
      rawResponse: {
        headers: responseHeaders,
        body: rawResponse,
      },
      request: { body: JSON.stringify(args) },
      response: getResponseMetadata(response),
      warnings,
    };
  }

  async doStream(
    options: Parameters<LanguageModelV1['doStream']>[0],
  ): Promise<Awaited<ReturnType<LanguageModelV1['doStream']>>> {
    const { args, warnings } = this.getArgs(options);

    const body = { ...args, stream: true };

    const { responseHeaders, value: response } = await postJsonToApi({
      url: `${this.config.baseURL}/chat/completions`,
      headers: combineHeaders(this.config.headers(), options.headers),
      body,
      failedResponseHandler: dudoxxFailedResponseHandler,
      successfulResponseHandler: createEventSourceResponseHandler(
        dudoxxChatChunkSchema,
      ),
      abortSignal: options.abortSignal,
      fetch: this.config.fetch,
    });

    const { messages: rawPrompt, ...rawSettings } = args;

    let finishReason: LanguageModelV1FinishReason = 'unknown';
    let usage: { promptTokens: number; completionTokens: number } = {
      promptTokens: 0,
      completionTokens: 0,
    };
    let chunkNumber = 0;

    return {
      stream: response.pipeThrough(
        new TransformStream<
          ParseResult<z.infer<typeof dudoxxChatChunkSchema>>,
          LanguageModelV1StreamPart
        >({
          transform(chunk, controller) {
            if (!chunk.success) {
              controller.enqueue({ 
                type: 'error', 
                error: new Error('Parse error occurred') 
              });
              return;
            }

            chunkNumber++;

            const value = chunk.value;

            if (chunkNumber === 1) {
              controller.enqueue({
                type: 'response-metadata',
                ...getResponseMetadata(value),
              });
            }

            // Check for usage data in streaming chunks
            if (value.usage != null) {
              usage = {
                promptTokens: value.usage.prompt_tokens || 0,
                completionTokens: value.usage.completion_tokens || 0,
              };
            }

            const choice = value.choices[0];

            if (choice?.finish_reason != null) {
              finishReason = mapDudoxxFinishReason(choice.finish_reason);
            }

            if (choice?.delta == null) {
              return;
            }

            const delta = choice.delta;

            if (delta.content != null) {
              controller.enqueue({
                type: 'text-delta',
                textDelta: delta.content,
              });
            }

            if (delta.tool_calls != null) {
              for (const toolCall of delta.tool_calls) {
                // Generate tool call ID if missing (DUDOXX streaming fix)
                const toolCallId = toolCall.id || `call_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
                
                // Handle tool call initialization
                if (toolCall.function?.name != null) {
                  // Validate tool call structure before processing
                  if (!toolCall.function.name || typeof toolCall.function.name !== 'string') {
                    console.warn('Invalid tool call: missing or invalid function name', toolCall);
                    continue;
                  }

                  controller.enqueue({
                    type: 'tool-call-delta',
                    toolCallType: 'function',
                    toolCallId,
                    toolName: toolCall.function.name,
                    argsTextDelta: toolCall.function.arguments || '',
                  });
                }

                // Handle arguments streaming
                if (toolCall.function?.arguments != null) {
                  controller.enqueue({
                    type: 'tool-call-delta',
                    toolCallType: 'function',
                    toolCallId,
                    toolName: toolCall.function.name || '',
                    argsTextDelta: toolCall.function.arguments,
                  });
                }
              }
            }
          },

          flush(controller) {
            // If DUDOXX streaming didn't provide usage data, we can't accurately estimate
            // So we leave it as 0 rather than providing potentially wrong estimates
            controller.enqueue({ type: 'finish', finishReason, usage });
          },
        }),
      ),
      rawCall: { rawPrompt, rawSettings },
      rawResponse: { headers: responseHeaders },
      request: { body: JSON.stringify(body) },
      warnings,
    };
  }
}

// DUDOXX Chat Response Schema (OpenAI-compatible)
const dudoxxChatResponseSchema = z.object({
  id: z.string().nullish(),
  created: z.number().nullish(),
  model: z.string().nullish(),
  choices: z.array(
    z.object({
      message: z.object({
        role: z.literal('assistant'),
        content: z.string().nullish(),
        tool_calls: z
          .array(
            z.object({
              id: z.string().optional(), // Made optional for DUDOXX compatibility
              type: z.literal('function'),
              function: z.object({
                name: z.string(),
                arguments: z.string(),
              }),
            }),
          )
          .nullish(),
      }),
      index: z.number(),
      finish_reason: z.string().nullish(),
    }),
  ),
  usage: z
    .object({
      prompt_tokens: z.number(),
      completion_tokens: z.number(),
      total_tokens: z.number().optional(),
    })
    .nullish(),
});

// DUDOXX Chat Chunk Schema for streaming
const dudoxxChatChunkSchema = z.object({
  id: z.string().nullish(),
  created: z.number().nullish(),
  model: z.string().nullish(),
  choices: z.array(
    z.object({
      delta: z.object({
        role: z.enum(['assistant']).optional(),
        content: z.string().nullish(),
        tool_calls: z
          .array(
            z.object({
              index: z.number().optional(),
              id: z.string().optional(), // Made optional for DUDOXX compatibility
              type: z.literal('function').optional(),
              function: z
                .object({
                  name: z.string().optional(),
                  arguments: z.string().optional(),
                })
                .optional(),
            }),
          )
          .nullish(),
      }),
      finish_reason: z.string().nullish(),
      index: z.number(),
    }),
  ),
  usage: z
    .object({
      prompt_tokens: z.number(),
      completion_tokens: z.number(),
      total_tokens: z.number().optional(),
    })
    .nullish(),
});