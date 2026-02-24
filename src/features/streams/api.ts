import { apiRequest } from '../../shared/api/client';
import {
  Stream,
  StreamSchema,
  CreateStreamDto,
  UpdateStreamDto,
  GetStreamsDto,
  GetStreamsResponse,
  GetStreamsResponseSchema,
} from '../../shared/lib/zod-schemas';

export const streamsApi = {
  getAll: async (params?: Partial<GetStreamsDto>): Promise<GetStreamsResponse> => {
    const response = await apiRequest<unknown>('/streams', {
      params: params as Record<string, string | number | boolean | undefined>,
    });
    return GetStreamsResponseSchema.parse(response);
  },

  getById: async (id: number): Promise<Stream> => {
    const response = await apiRequest<unknown>(`/streams/${id}`);
    return StreamSchema.parse(response);
  },

  create: async (data: CreateStreamDto): Promise<Stream> => {
    const response = await apiRequest<unknown, CreateStreamDto>('/streams', {
      method: 'POST',
      body: data,
    });
    return StreamSchema.parse(response);
  },

  update: async (id: number, data: UpdateStreamDto): Promise<Stream> => {
    const response = await apiRequest<unknown, UpdateStreamDto>(`/streams/${id}`, {
      method: 'PUT',
      body: data,
    });
    return StreamSchema.parse(response);
  },

  trash: async (id: number): Promise<Stream> => {
    const response = await apiRequest<unknown>(`/streams/${id}/trash`, {
      method: 'PATCH',
    });
    return StreamSchema.parse(response);
  },

  restore: async (id: number): Promise<Stream> => {
    const response = await apiRequest<unknown>(`/streams/${id}/restore`, {
      method: 'PATCH',
    });
    return StreamSchema.parse(response);
  },

  deletePermanently: async (id: number): Promise<void> => {
    await apiRequest(`/streams/${id}`, {
      method: 'DELETE',
    });
  },

  /** Users that have at least one stream (for admin filter). GET /streams/owners?search=...&limit=50 */
  getStreamOwners: async (params?: { search?: string; limit?: number }): Promise<StreamOwner[]> => {
    try {
      const response = await apiRequest<StreamOwner[]>('/streams/owners', {
        params: params as Record<string, string | number | undefined>,
      });
      return Array.isArray(response) ? response : [];
    } catch {
      return [];
    }
  },
};

export interface StreamOwner {
  id: number;
  name?: string;
  email: string;
}
