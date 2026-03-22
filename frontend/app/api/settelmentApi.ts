import axiosInstance from './axiosConfig';

export interface Settlement{
    fromUserId: number,
    toUserId: number,
    from: string,
    to: string,
    amount: number,
}

export interface Balance{
    userId: number,
    userName: string,
    balance: number,
}

export interface PendingSettlement {
    id: number,
    fromUserId: number,
    fromUserName: string,
    toUserId: number,
    toUserName: string,
    amount: number,
    status: string,
    groupId: number,
}

export interface EsewaPaymentRequest {
    amount: string,
    taxAmount: string,
    totalAmount: string,
    transactionUuid: string,
    productCode: string,
    productServiceCharge: string,
    productDeliveryCharge: string,
    successUrl: string,
    failureUrl: string,
    signedFieldNames: string,
    signature: string,
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

  initiateCashSettlement: async (
        groupId: number,
        toUserId: number,
        amount: number
    ): Promise<PendingSettlement> => {
        try {
            const response = await axiosInstance.post<PendingSettlement>(`/splitra/settlement/cash`, {
                groupId,
                toUserId,
                amount,
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    confirmSettlement: async (settlementId: number): Promise<void> => {
        try {
            await axiosInstance.post(`/splitra/settlement/confirm/${settlementId}`);
        } catch (error) {
            throw error;
        }
    },

    getPendingSettlements: async (): Promise<PendingSettlement[]> => {
    try {
        const response = await axiosInstance.get<PendingSettlement[]>(
            `/splitra/settlement/cash/pending`
        );
        return response.data;
    } catch (error) {
        throw error;
    }
},

    initiateEsewaPayment: async ( groupId: number, toUserId: number, amount: number): Promise<EsewaPaymentRequest> => {
        try {
            const response = await axiosInstance.post<EsewaPaymentRequest>(
                `/splitra/esewa/initiate`,
                { groupId, toUserId, amount }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    verifyEsewaPayment: async (
        productCode: string,
        transactionUuid: string,
        totalAmount: string
    ): Promise<void> => {
        try {
            await axiosInstance.post(`/splitra/esewa/verify`, {
                productCode,
                transactionUuid,
                totalAmount,
            });
        } catch (error) {
            throw error;
        }
    },
};

