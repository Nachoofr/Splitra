import axiosInstance from './axiosConfig';

export interface ExpensePayment{
    id: number;
    expenseId: number;
    paidByUserId: number;
    paidByUserName: string; 
    amountPaid: number;
}


export interface TotalExpenseByGroup{
    totalExpense: number;
}

export interface Expense{
    id: number;
    description: string;
    amount: number;
    createdByUsername: string;
    categoryName: string;
    paidBy: ExpensePayment[];
    date: string;
    


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