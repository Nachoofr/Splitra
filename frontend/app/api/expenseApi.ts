import axiosInstance from './axiosConfig';

export interface Category{
  id: number;
  name: string;
}

export interface User{
  id: number;
  name: string;
}

export interface TotalExpenseByGroup{
    totalExpense: number;
}

export interface Expense{
    id: number;
    description: string;
    amount: number;
    category: Category;
    paidBy: User[];

}

export const expenseApi = {
  getTotalExpenseByGroup: async (groupId: number): Promise<number> => {
    try {
      const response = await axiosInstance.get<number>(`/splitra/expenses/group/${groupId}/total`);
      return response.data;
    } catch (error) {
      throw error;
    }
    },

    getAllExpenses: async (groupId: number): Promise<Expense[]> => {
      try{
        const response = await axiosInstance.get<Expense[]>(`/splitra/expenses/group/${groupId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
      }
    }