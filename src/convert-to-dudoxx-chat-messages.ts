import {
  LanguageModelV1Prompt,
  UnsupportedFunctionalityError,
} from '@ai-sdk/provider';
import { convertUint8ArrayToBase64 } from '@ai-sdk/provider-utils';
import { DudoxxPrompt } from './dudoxx-chat-prompt';

export function convertToDudoxxChatMessages(
  prompt: LanguageModelV1Prompt,
): DudoxxPrompt {
  const messages: DudoxxPrompt = [];

  for (const { role, content } of prompt) {
    switch (role) {
      case 'system': {
        messages.push({ role: 'system', content });
        break;
      }

      case 'user': {
        messages.push({
          role: 'user',
          content: content.map(part => {
            switch (part.type) {
              case 'text': {
                return { type: 'text', text: part.text };
              }
              case 'image': {
                return {
                  type: 'image_url',
                  image_url:
                    part.image instanceof URL
                      ? part.image.toString()
                      : `data:${
                          part.mimeType ?? 'image/jpeg'
                        };base64,${convertUint8ArrayToBase64(part.image)}`,
                };
              }
              case 'file': {
                throw new UnsupportedFunctionalityError({
                  functionality: 'File content parts in user messages',
                });
              }
            }
          }),
        });
        break;
      }

      case 'assistant': {
        let text = '';
        const toolCalls: Array<{
          id: string;
          type: 'function';
          function: { name: string; arguments: string };
        }> = [];

        for (const part of content) {
          switch (part.type) {
            case 'text': {
              text += part.text;
              break;
            }
            case 'tool-call': {
              toolCalls.push({
                id: part.toolCallId,
                type: 'function',
                function: {
                  name: part.toolName,
                  arguments: JSON.stringify(part.args),
                },
              });
              break;
            }
          }
        }

        // DUDOXX compatibility: assistant message must have either content OR tool_calls, not both
        if (toolCalls.length > 0) {
          // If there are tool calls, send tool calls only (no content)
          messages.push({
            role: 'assistant',
            content: null as any, // DUDOXX requires null content when tool_calls present
            tool_calls: toolCalls,
          });
        } else if (text) {
          // If there's text content, send content only (no tool_calls)
          messages.push({
            role: 'assistant',
            content: text,
          });
        }

        break;
      }

      case 'tool': {
        for (const toolResponse of content) {
          messages.push({
            role: 'tool',
            content: JSON.stringify(toolResponse.result),
            tool_call_id: toolResponse.toolCallId,
          });
        }
        break;
      }

      default: {
        const _exhaustiveCheck: never = role;
        throw new Error(`Unsupported role: ${_exhaustiveCheck}`);
      }
    }
  }

  return messages;
}