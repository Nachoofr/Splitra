import axiosInstance from './axiosConfig';

export interface Category {
  id: number;
  name: string;
  groupId?: number;
  isGlobal: boolean;
}

export interface CategoryRequest {
  name: string
}

export const categoryApi = {
  getAllCategories: async (): Promise<Category[]> => {
    try {
      const response = await axiosInstance.get<Category[]>('/splitra/categories');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCategoriesByGroupId: async (groupId: number): Promise<Category[]> => {
    try {
      const response = await axiosInstance.get<Category[]>(`/splitra/categories/group/${groupId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  createCategory: async (groupId: number, name: string): Promise<Category> => {
    try {
      const response = await axiosInstance.post<Category>(
        `/splitra/categories`,
        {
          name: name,
          groupId: groupId
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};