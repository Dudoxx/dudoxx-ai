import {
  createJsonErrorResponseHandler,
  type ResponseHandler,
} from '@ai-sdk/provider-utils';
import { APICallError } from '@ai-sdk/provider';
import { z } from 'zod';

const dudoxxErrorDataSchema = z.object({
  error: z.object({
    message: z.string(),
    type: z.string().optional(),
    param: z.string().nullish(),
    code: z.string().nullish(),
  }),
});

export type DudoxxErrorData = z.infer<typeof dudoxxErrorDataSchema>;

export const dudoxxFailedResponseHandler: ResponseHandler<APICallError> =
  createJsonErrorResponseHandler({
    errorSchema: dudoxxErrorDataSchema,
    errorToMessage: data => data.error.message,
  });