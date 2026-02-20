import { toast } from '../ui/toast';

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? '/api';

export async function apiRequest<TResponse = void, TBody = unknown>(
  endpoint: string,
  options?: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: TBody;
    params?: Record<string, string | number | boolean | undefined>;
  }
): Promise<TResponse> {
  const { method = 'GET', body, params } = options || {};

  let url = `${BASE_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  try {
    const response = await fetch(url, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
    });

    if (response.status === 401) {
      throw new ApiError(401, 'Unauthorized');
    }

    if (response.status === 403) {
      throw new ApiError(403, 'Access denied');
    }

    if (response.status === 204) {
      return undefined as TResponse;
    }

    const data = await response.json();

    if (!response.ok) {
      const message = data?.message || 'Request failed';
      throw new ApiError(response.status, message, data);
    }

    return data as TResponse;
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status !== 401 && error.status !== 403) {
        toast.error(error.message);
      }
      throw error;
    }

    const message = error instanceof Error ? error.message : 'Network error';
    toast.error(message);
    throw new ApiError(0, message);
  }
}
