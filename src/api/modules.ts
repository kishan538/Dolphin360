import {apiClient} from './client';

export interface Module {
  id: number;
  name: string;
  slug: string;
  description?: string;
  [key: string]: unknown;
}

export interface ModulesResponse {
  success: boolean;
  message: string;
  data: {
    modules: Module[];
  };
}

export const getModules = async (): Promise<ModulesResponse> => {
  const response = await apiClient.get<ModulesResponse>('/api/modules');
  return response.data;
};

