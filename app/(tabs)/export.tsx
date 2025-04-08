import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import useExportRequest from "@/services/useExportRequestService";
import { ExportRequestStatus, ExportRequestType } from "@/types/exportRequest.type";
import { useDispatch } from "react-redux";
import { setPaperData } from "@/redux/paperSlice";

const queryClient = new QueryClient();

function ExportListComponent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"Done" | "Not done">("Not done");
  const [searchQuery, setSearchQuery] = useState("");
  const dispatch = useDispatch();

  // Gọi fake API qua react-query
  const { fetchExportRequests } = useExportRequest();
  const { data: exportRequests, isLoading } = useQuery({
    queryKey: ["export-requests"],
    queryFn: fetchExportRequests,
  });

  // Lọc theo trạng thái dựa vào tab được chọn
  const filteredByStatus =
    exportRequests?.filter((request: ExportRequestType) => {
      if (activeTab === "Not done") {
        return [
          ExportRequestStatus.PROCESSING,
          ExportRequestStatus.CHECKING,
          ExportRequestStatus.CHECKED,
          ExportRequestStatus.WAITING_EXPORT,
        ].includes(request.status);
      } else if (activeTab === "Done") {
        return [ExportRequestStatus.COMPLETED, ExportRequestStatus.CANCELLED].includes(request.status);
      }
      return false;
    }) || [];

  // Áp dụng search theo mã phiếu xuất
  const filteredExports = filteredByStatus.filter((request: ExportRequestType) =>
    request.exportRequestId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectExport = (request: ExportRequestType) => {
    dispatch(
      setPaperData({
        exportRequestId: parseInt(request.exportRequestId),
        description: request.exportReason || "Không có lý do",
      })
    );
    // router.push(`/export/export-order/${request.exportRequestId}`);
  };
  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="px-5">
        <View className="bg-[#1677ff] px-4 py-7 flex-row items-center rounded-2xl">
          <Text className="text-white text-lg font-bold ml-4 flex-1">Danh sách phiếu xuất</Text>
        </View>
      </View>


      {/* Tabs */}
      <View className="px-5 mt-3">
        <View className="flex-row my-3 bg-gray-200 rounded-lg p-1">
          {["Done", "Not done"].map((tab) => (
            <TouchableOpacity
              key={tab}
              className={`flex-1 py-2 rounded-lg ${activeTab === tab ? "bg-white" : "bg-gray-200"}`}
              onPress={() => setActiveTab(tab as "Done" | "Not done")}
            >
              <Text className={`text-center font-semibold ${activeTab === tab ? "text-black" : "text-gray-500"}`}>
                {tab === "Not done" ? "Chưa hoàn thành" : "Hoàn thành"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Thanh Search */}
      <View className="px-5 mt-3">
        <TextInput
          placeholder="Tìm theo mã phiếu xuất"
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="bg-white p-3 rounded-lg shadow"
        />
      </View>

      {/* Danh sách phiếu xuất */}
      <ScrollView className="px-5 flex-1">
        {isLoading ? (
          <ActivityIndicator size="large" color="black" className="my-5" />
        ) : filteredExports.length > 0 ? (
          filteredExports.map((request: ExportRequestType) => (
            <TouchableOpacity
              key={request.exportRequestId}
              className="flex-row items-center py-6 my-2 px-5 rounded-3xl bg-white"
              onPress={() => handleSelectExport(request)}
            >
              {/* Icon trạng thái */}
              <View className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gray-400">
                <FontAwesome name="spinner" size={20} color="white" />
              </View>

              {/* Thông tin phiếu xuất */}
              <View className="ml-4 flex-1">
                <Text className="text-gray-500 text-sm">Mã phiếu xuất</Text>
                <Text className="font-semibold text-black">#{request.exportRequestId}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text className="text-center text-gray-500 mt-5">Không có phiếu xuất</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export default function ExportList() {
  return (
    <QueryClientProvider client={queryClient}>
      <ExportListComponent />
    </QueryClientProvider>
  );
}
