// DUDOXX Chat Message Types
// DUDOXX follows OpenAI-compatible API format

export type DudoxxPrompt = Array<
  | DudoxxSystemMessage
  | DudoxxUserMessage
  | DudoxxAssistantMessage
  | DudoxxToolMessage
>;

export interface DudoxxSystemMessage {
  role: 'system';
  content: string;
}

export interface DudoxxUserMessage {
  role: 'user';
  content: Array<DudoxxTextContentPart | DudoxxImageContentPart>;
}

export interface DudoxxAssistantMessage {
  role: 'assistant';
  content: string;
  tool_calls?: Array<{
    id: string;
    type: 'function';
    function: { name: string; arguments: string };
  }>;
}

export interface DudoxxToolMessage {
  role: 'tool';
  content: string;
  tool_call_id: string;
}

export interface DudoxxTextContentPart {
  type: 'text';
  text: string;
}

export interface DudoxxImageContentPart {
  type: 'image_url';
  image_url: string | { url: string; detail?: 'low' | 'high' | 'auto' };
}