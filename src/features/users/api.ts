import { apiRequest } from '../../shared/api/client';

export type UserRole = 'user' | 'admin';

export type SortOrder = 'asc' | 'desc';

export type Scope = 'alive' | 'deleted' | 'all';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface GetUsersParams {
  page?: number;
  limit?: number;
  sort?: SortOrder;
  scope?: Scope;
  role?: UserRole;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface GetUsersResponse {
  total: number;
  totalFiltered: number;
  pages: number;
  data: User[];
}

export const usersApi = {
  getList: async (params?: GetUsersParams): Promise<GetUsersResponse> => {
    const response = await apiRequest<GetUsersResponse>('/users', {
      params: params as Record<string, string | number | undefined>,
    });
    return response as GetUsersResponse;
  },
};
