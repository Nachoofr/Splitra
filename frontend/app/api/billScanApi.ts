import axiosInstance from "./axiosConfig";

export interface BillItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface BillScanResult {
  merchantName: string;
  totalAmount: number;
  date: string | null;
  suggestedCategory: string;
  items: BillItem[];
  rawText: string;
  vatAmount: number;
  success: boolean;
  errorMessage?: string;
}

export const billScanApi = {
  scanBill: async (
    imageBase64: string,
    mimeType: string = "image/jpeg"
  ): Promise<BillScanResult> => {
    try {
      const base64Data = imageBase64.includes(",")
        ? imageBase64.split(",")[1]
        : imageBase64;

      const response = await axiosInstance.post<BillScanResult>(
        "/splitra/bill/scan",
        {
          imageBase64: base64Data,
          mimeType,
        },
        {
          timeout: 60000
        }
        
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};