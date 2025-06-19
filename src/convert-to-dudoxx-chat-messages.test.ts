import { LanguageModelV1Prompt } from '@ai-sdk/provider';
import { convertToDudoxxChatMessages } from './convert-to-dudoxx-chat-messages';

describe('convertToDudoxxChatMessages', () => {
  it('should convert system messages', () => {
    const prompt: LanguageModelV1Prompt = [
      { role: 'system', content: 'You are a helpful assistant.' },
    ];

    const result = convertToDudoxxChatMessages(prompt);

    expect(result).toStrictEqual([
      { role: 'system', content: 'You are a helpful assistant.' },
    ]);
  });

  it('should convert user messages with text content', () => {
    const prompt: LanguageModelV1Prompt = [
      { role: 'user', content: [{ type: 'text', text: 'Hello' }] },
    ];

    const result = convertToDudoxxChatMessages(prompt);

    expect(result).toStrictEqual([
      {
        role: 'user',
        content: [{ type: 'text', text: 'Hello' }],
      },
    ]);
  });

  it('should convert user messages with image content', () => {
    const prompt: LanguageModelV1Prompt = [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'What is in this image?' },
          {
            type: 'image',
            image: new Uint8Array([1, 2, 3]),
            mimeType: 'image/png',
          },
        ],
      },
    ];

    const result = convertToDudoxxChatMessages(prompt);

    expect(result).toStrictEqual([
      {
        role: 'user',
        content: [
          { type: 'text', text: 'What is in this image?' },
          {
            type: 'image_url',
            image_url: 'data:image/png;base64,AQID',
          },
        ],
      },
    ]);
  });

  it('should convert user messages with image URL', () => {
    const prompt: LanguageModelV1Prompt = [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'What is in this image?' },
          {
            type: 'image',
            image: new URL('https://example.com/image.jpg'),
          },
        ],
      },
    ];

    const result = convertToDudoxxChatMessages(prompt);

    expect(result).toStrictEqual([
      {
        role: 'user',
        content: [
          { type: 'text', text: 'What is in this image?' },
          {
            type: 'image_url',
            image_url: 'https://example.com/image.jpg',
          },
        ],
      },
    ]);
  });

  it('should convert assistant messages with text content', () => {
    const prompt: LanguageModelV1Prompt = [
      {
        role: 'assistant',
        content: [{ type: 'text', text: 'Hello! How can I help you?' }],
      },
    ];

    const result = convertToDudoxxChatMessages(prompt);

    expect(result).toStrictEqual([
      {
        role: 'assistant',
        content: 'Hello! How can I help you?',
      },
    ]);
  });

  it('should convert assistant messages with tool calls', () => {
    const prompt: LanguageModelV1Prompt = [
      {
        role: 'assistant',
        content: [
          { type: 'text', text: 'I will call a tool for you.' },
          {
            type: 'tool-call',
            toolCallId: 'call_123',
            toolName: 'get_weather',
            args: { city: 'San Francisco' },
          },
        ],
      },
    ];

    const result = convertToDudoxxChatMessages(prompt);

    expect(result).toStrictEqual([
      {
        role: 'assistant',
        content: null, // DUDOXX requires null content when tool_calls present
        tool_calls: [
          {
            id: 'call_123',
            type: 'function',
            function: {
              name: 'get_weather',
              arguments: '{"city":"San Francisco"}',
            },
          },
        ],
      },
    ]);
  });

  it('should convert tool messages', () => {
    const prompt: LanguageModelV1Prompt = [
      {
        role: 'tool',
        content: [
          {
            type: 'tool-result',
            toolCallId: 'call_123',
            toolName: 'get_weather',
            result: { temperature: 22, conditions: 'sunny' },
          },
        ],
      },
    ];

    const result = convertToDudoxxChatMessages(prompt);

    expect(result).toStrictEqual([
      {
        role: 'tool',
        content: '{"temperature":22,"conditions":"sunny"}',
        tool_call_id: 'call_123',
      },
    ]);
  });

  it('should convert complex conversation', () => {
    const prompt: LanguageModelV1Prompt = [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: [{ type: 'text', text: 'What is the weather?' }] },
      {
        role: 'assistant',
        content: [
          { type: 'text', text: 'I will check the weather for you.' },
          {
            type: 'tool-call',
            toolCallId: 'call_123',
            toolName: 'get_weather',
            args: { city: 'default' },
          },
        ],
      },
      {
        role: 'tool',
        content: [
          {
            type: 'tool-result',
            toolCallId: 'call_123',
            toolName: 'get_weather',
            result: { temperature: 22, conditions: 'sunny' },
          },
        ],
      },
      {
        role: 'assistant',
        content: [{ type: 'text', text: 'It is 22°C and sunny.' }],
      },
    ];

    const result = convertToDudoxxChatMessages(prompt);

    expect(result).toStrictEqual([
      { role: 'system', content: 'You are a helpful assistant.' },
      {
        role: 'user',
        content: [{ type: 'text', text: 'What is the weather?' }],
      },
      {
        role: 'assistant',
        content: null, // DUDOXX requires null content when tool_calls present
        tool_calls: [
          {
            id: 'call_123',
            type: 'function',
            function: {
              name: 'get_weather',
              arguments: '{"city":"default"}',
            },
          },
        ],
      },
      {
        role: 'tool',
        content: '{"temperature":22,"conditions":"sunny"}',
        tool_call_id: 'call_123',
      },
      {
        role: 'assistant',
        content: 'It is 22°C and sunny.',
      },
    ]);
  });

  it('should throw error for unsupported file content', () => {
    const prompt: LanguageModelV1Prompt = [
      {
        role: 'user',
        content: [
          {
            type: 'file',
            data: new Uint8Array([1, 2, 3]),
            mimeType: 'application/pdf',
          },
        ],
      },
    ];

    expect(() => convertToDudoxxChatMessages(prompt)).toThrow(
      'File content parts in user messages',
    );
  });
});