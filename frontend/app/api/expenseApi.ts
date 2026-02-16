import axiosInstance from './axiosConfig';

export interface ExpensePayment{
    id: number;
    expenseId: number;
    paidByUserId: number;
    paidByUserName: string; 
    amountPaid: number;
}

export interface ExpensePaymentRequest{
    paidByUserId: number;
    amountPaid: number;
}


export interface AddExpenseRequest{
  description: string;
  amount: number;
  date: string;
  category: number;
  paidBy: ExpensePaymentRequest[];
  splitMethod: string;
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
      },

    addExpense: async (data: AddExpenseRequest, groupId: number): Promise<Expense> => {
      try {
        const response = await axiosInstance.post<Expense>(`/splitra/expenses/group/${groupId}`,
      {
        description: data.description,
        amount: data.amount,
        category: data.category,
        splitMethod: data.splitMethod,
        paidBy: data.paidBy
      }
    );
      return response.data;
    } catch (error) {
      throw error;
    }
    },

    getExpenseById: async (expenseId: number): Promise<Expense> => {
      try {
        const response = await axiosInstance.get<Expense>(`/splitra/expenses/${expenseId}`);
        return response.data;
      } catch (error) {
    throw error;
  }
},

    deleteExpense: async (expenseId: number, groupId: number): Promise<void> => {
      try {
        const response = await axiosInstance.delete<void>(`/splitra/expenses/${expenseId}/group/${groupId}`);
        return response.data;
      } catch (error) {
    throw error;
      }
      },
    }
