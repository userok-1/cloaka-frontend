import { apiRequest } from '../../shared/api/client';
import {
  Stream,
  StreamSchema,
  CreateStreamDto,
  UpdateStreamDto,
  GetStreamsDto,
} from '../../shared/lib/zod-schemas';
import { z } from 'zod';

export const streamsApi = {
  getAll: async (params?: Partial<GetStreamsDto>): Promise<Stream[]> => {
    const response = await apiRequest<unknown>('/streams', {
      params: params as Record<string, string | number | boolean | undefined>,
    });
    return z.array(StreamSchema).parse(response);
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
};
