import axiosInstance from './axiosConfig';

export interface Settlement{
    from: string,
    to: string,
    amount: number,
}

export interface Balance{
    userId: number,
    userName: string,
    balance: number,
}

export const settlementApi= {
    getSettlement: async (groupId: number): Promise<Settlement[]> => {
        try{
            const response = await axiosInstance.get<Settlement[]>(`/splitra/settlements/${groupId}`);
            return response.data;
        }catch (error) {
            throw error;
        }
    },

    getGroupBalance: async (groupId: number): Promise<Balance[]> => {
        try{
            const response = await axiosInstance.get<Balance[]>(`/splitra/balance/${groupId}`);
            return response.data;
        }catch (error) {
            throw error;
        }

  },


}