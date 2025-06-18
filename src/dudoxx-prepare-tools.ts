import {
  LanguageModelV1,
  LanguageModelV1CallWarning,
  UnsupportedFunctionalityError,
} from '@ai-sdk/provider';

export function prepareTools(
  mode: Parameters<LanguageModelV1['doGenerate']>[0]['mode'] & {
    type: 'regular';
  },
): {
  tools:
    | Array<{
        type: 'function';
        function: {
          name: string;
          description: string | undefined;
          parameters: unknown;
        };
      }>
    | undefined;
  tool_choice:
    | { type: 'function'; function: { name: string } }
    | 'auto'
    | 'none'
    | 'required'
    | undefined;
  toolWarnings: LanguageModelV1CallWarning[];
} {
  // when the tools array is empty, change it to undefined to prevent errors:
  const tools = mode.tools?.length ? mode.tools : undefined;
  const toolWarnings: LanguageModelV1CallWarning[] = [];

  if (tools == null) {
    return { tools: undefined, tool_choice: undefined, toolWarnings };
  }

  const dudoxxTools: Array<{
    type: 'function';
    function: {
      name: string;
      description: string | undefined;
      parameters: unknown;
    };
  }> = [];

  for (const tool of tools) {
    if (tool.type === 'provider-defined') {
      toolWarnings.push({ type: 'unsupported-tool', tool });
    } else {
      // Validate tool structure
      if (!tool.name || typeof tool.name !== 'string') {
        toolWarnings.push({ 
          type: 'other' as const, 
          message: `Invalid tool name: ${tool.name}. Tool names must be non-empty strings.` 
        });
        continue;
      }

      // Validate tool name format (alphanumeric + underscores only)
      if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(tool.name)) {
        toolWarnings.push({ 
          type: 'other' as const, 
          message: `Invalid tool name format: ${tool.name}. Must start with letter and contain only alphanumeric characters and underscores.` 
        });
        continue;
      }

      // Validate parameters schema
      if (tool.parameters && typeof tool.parameters === 'object') {
        try {
          JSON.stringify(tool.parameters);
        } catch (error) {
          toolWarnings.push({ 
            type: 'other' as const, 
            message: `Invalid parameters schema for tool ${tool.name}: ${error instanceof Error ? error.message : 'Unknown error'}` 
          });
          continue;
        }
      }

      dudoxxTools.push({
        type: 'function',
        function: {
          name: tool.name,
          description: tool.description || `Tool: ${tool.name}`,
          parameters: tool.parameters || { type: 'object', properties: {} },
        },
      });
    }
  }

  const toolChoice = mode.toolChoice;

  if (toolChoice == null) {
    return { tools: dudoxxTools, tool_choice: undefined, toolWarnings };
  }

  const type = toolChoice.type;

  switch (type) {
    case 'auto':
    case 'none':
    case 'required':
      return { tools: dudoxxTools, tool_choice: type, toolWarnings };

    // DUDOXX supports direct tool choice by name
    case 'tool':
      return {
        tools: dudoxxTools,
        tool_choice: {
          type: 'function',
          function: { name: toolChoice.toolName },
        },
        toolWarnings,
      };

    default: {
      const _exhaustiveCheck: never = type;
      throw new UnsupportedFunctionalityError({
        functionality: `Unsupported tool choice type: ${_exhaustiveCheck}`,
      });
    }
  }
}