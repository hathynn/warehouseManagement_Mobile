import { useState } from "react";
import { ExportRequestDetailType } from "../types/exportRequestDetail.type";
import useApiService from "./useApi";



const useExportRequestDetail = () => {
  const { loading, callApi, setIsLoading } = useApiService();
  const [exportRequestDetails, setExportRequestDetails] = useState<
    ExportRequestDetailType[]
  >([]);

  const fetchExportRequestDetails = async (
    exportRequestId: string,
    page = 1,
    limit = 100
  ): Promise<ExportRequestDetailType[]> => {
    try {
      const response = await callApi(
        "get",
        `/export-request-detail/${exportRequestId}`,
        
        { params: { page, limit } } // config → query string
      );
      return response.content || [];
    } catch (error) {
      console.error("❌ Lỗi khi lấy chi tiết đơn xuất:", error);
      return [];
    }
  };

  const updateActualQuantity = async (
    exportRequestDetailId: string,
    inventoryItemId: string
  ): Promise<boolean> => {
    try {
      const payload = {
        exportRequestDetailId,
        inventoryItemId,
      };
      await callApi("put", `/export-request-detail/actual-quantity`, payload);
      return true;
    } catch (error: any) {
      console.error(
        "❌ Lỗi khi cập nhật actualQuantity:",
        error?.response?.data || error
      );
      throw error;
    }
  };

  const confirmCountedExportRequest = async (
    exportRequestId: string
  ): Promise<boolean> => {
    try {
      await callApi(
        "post",
        `/export-request/confirm-counted/${exportRequestId}`
      );
      return true;
    } catch (error) {
      console.error("❌ Lỗi khi xác nhận kiểm đếm:", error);
      return false;
    }
  };

  return {
    loading,
    exportRequestDetails,
    fetchExportRequestDetails,
    updateActualQuantity,
    confirmCountedExportRequest,
  };
};

export default useExportRequestDetail;
