import { apiRequest } from '../../shared/api/client';
import {
  ApiKeyResponseSchema,
  ChangePasswordDto,
  PublicUser,
  PublicUserSchema,
  UpdateProfileDto,
  UserLoginDto,
  UserRegisterDto,
} from '../../shared/lib/zod-schemas';

export const authApi = {
  register: async (data: UserRegisterDto): Promise<PublicUser> => {
    const response = await apiRequest<unknown, UserRegisterDto>('/auth/register', {
      method: 'POST',
      body: data,
    });
    return PublicUserSchema.parse(response);
  },

  login: async (data: UserLoginDto): Promise<PublicUser> => {
    const response = await apiRequest<unknown, UserLoginDto>('/auth/login', {
      method: 'POST',
      body: data,
    });
    return PublicUserSchema.parse(response);
  },

  logout: async (): Promise<void> => {
    await apiRequest('/auth/logout', {
      method: 'POST',
    });
  },

  getCurrentUser: async (): Promise<PublicUser | null> => {
    try {
      const response = await apiRequest<unknown>('/auth/me');
      return PublicUserSchema.parse(response);
    } catch {
      return null;
    }
  },

  /** PATCH body: name (optional), email */
  updateProfile: async (data: UpdateProfileDto): Promise<PublicUser> => {
    const response = await apiRequest<unknown, UpdateProfileDto>('/auth/me', {
      method: 'PATCH',
      body: data,
    });
    return PublicUserSchema.parse(response);
  },

  changePassword: async (data: ChangePasswordDto): Promise<void> => {
    await apiRequest<void, ChangePasswordDto>('/auth/change-password', {
      method: 'POST',
      body: data,
    });
  },

  getApiKey: async (): Promise<string> => {
    const response = await apiRequest<unknown>('/auth/api-key');
    const parsed = ApiKeyResponseSchema.safeParse(response);
    if (!parsed.success) {
      throw new Error('Invalid API key response');
    }
    const key = parsed.data.apiKey ?? parsed.data.key;
    if (!key) {
      throw new Error('Invalid API key response');
    }
    return key;
  },
};
