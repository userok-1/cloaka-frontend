import { z } from 'zod';

export const UserRoleSchema = z.enum(['user', 'admin']);

export const StreamModeSchema = z.enum(['redirect', 'fingerprint']);

export const StreamScopeSchema = z.enum(['alive', 'deleted', 'all']);

export const StreamSortBySchema = z.enum(['createdAt', 'name']);

export const SortOrderSchema = z.enum(['asc', 'desc']);

export const PublicUserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  role: UserRoleSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const UserRegisterDtoSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().min(5).max(150),
  password: z
    .string()
    .min(8)
    .max(128)
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
    .regex(/\d/, 'Password must contain at least one digit'),
});

export const UserLoginDtoSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const StreamDetectorsOptionsDtoSchema = z
  .object({
    userAgent: z.boolean().optional(),
    screen: z.boolean().optional(),
    botsDatabase: z.boolean().optional(),
    vpnProxy: z.boolean().optional(),
  })
  .catchall(z.boolean());

export const CreateStreamDtoSchema = z.object({
  name: z.string().min(2).max(100),
  landingUrl: z.string().url(),
  whiteUrl: z.string().url(),
  mode: StreamModeSchema.optional().default('redirect'),
  detectorsOptions: StreamDetectorsOptionsDtoSchema.optional(),
  allowedGeos: z
    .array(z.string().length(2).toUpperCase())
    .max(50)
    .optional()
    .refine(
      (arr) => {
        if (!arr) return true;
        return new Set(arr).size === arr.length;
      },
      { message: 'Geo codes must be unique' }
    ),
});

export const UpdateStreamDtoSchema = CreateStreamDtoSchema.partial();

export const GetStreamsDtoSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(50),
  sort: SortOrderSchema.optional().default('desc'),
  sortBy: StreamSortBySchema.optional().default('createdAt'),
  scope: StreamScopeSchema.optional().default('alive'),
  userId: z.number().int().optional(),
});

export const StreamDetectorsOptionsSchema = z
  .object({
    userAgent: z.boolean(),
    screen: z.boolean(),
    botsDatabase: z.boolean(),
    vpnProxy: z.boolean(),
  })
  .catchall(z.boolean());

export const StreamSchema = z.object({
  id: z.number(),
  userId: z.number(),
  name: z.string(),
  landingUrl: z.string().url(),
  whiteUrl: z.string().url(),
  allowedGeos: z.array(z.string()).nullable().optional(),
  mode: StreamModeSchema,
  detectorsOptions: StreamDetectorsOptionsSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable().optional(),
});

export const FilterResponseDtoSchema = z.object({
  url: z.string().url(),
});

export const FilterLogSchema = z.object({
  id: z.union([z.number(), z.string()]),
  streamId: z.number(),
  passed: z.boolean(),
  reason: z.string().nullable().optional(),
  metadata: z.unknown().nullable().optional(),
  createdAt: z.string(),
});

export const ErrorLogSchema = z.object({
  id: z.number(),
  statusCode: z.number().optional(),
  module: z.string().optional(),
  controller: z.string().optional(),
  handler: z.string().optional(),
  message: z.string(),
  stackTrace: z.string().nullable().optional(),
  metadata: z.unknown().nullable().optional(),
  createdAt: z.string(),
});

export const GetLogsQuery = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(1000).optional().default(50),
  sort: SortOrderSchema.optional().default('desc'),
  streamIds: z.string().optional(),
});

export function PaginatedResponseSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    data: z.array(itemSchema),
    total: z.number().optional(),
  });
}

export type PublicUser = z.infer<typeof PublicUserSchema>;
export type UserRegisterDto = z.infer<typeof UserRegisterDtoSchema>;
export type UserLoginDto = z.infer<typeof UserLoginDtoSchema>;
export type CreateStreamDto = z.infer<typeof CreateStreamDtoSchema>;
export type UpdateStreamDto = z.infer<typeof UpdateStreamDtoSchema>;
export type GetStreamsDto = z.infer<typeof GetStreamsDtoSchema>;
export type Stream = z.infer<typeof StreamSchema>;
export type StreamDetectorsOptions = z.infer<typeof StreamDetectorsOptionsSchema>;
export type StreamDetectorsOptionsDto = z.infer<typeof StreamDetectorsOptionsDtoSchema>;
export type FilterResponseDto = z.infer<typeof FilterResponseDtoSchema>;
export type FilterLog = z.infer<typeof FilterLogSchema>;
export type ErrorLog = z.infer<typeof ErrorLogSchema>;
export type GetLogsQuery = z.infer<typeof GetLogsQuery>;
