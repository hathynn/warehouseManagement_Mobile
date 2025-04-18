import { updateActual } from "@/redux/productSlice";
import { RootState } from "@/redux/store";
import { Ionicons } from "@expo/vector-icons";
import { ChevronDown } from "@tamagui/lucide-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import {
  Accordion,
  Button,
  H3,
  H4,
  Input,
  Label,
  Paragraph,
  Square,
  XStack,
  YStack,
} from "tamagui";

const Confirm = () => {
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [searchId, setSearchId] = useState("");
  const [filtered, setFiltered] = useState(false);

  const { id } = useLocalSearchParams<{ id: string }>();
  const products = useSelector((state: RootState) => state.product.products);

  const filteredProducts = filtered
    ? products.filter((p) => String(p.id).includes(searchId.trim()))
    : products;

  const dispatch = useDispatch();

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );
  const [inputValue, setInputValue] = useState("");

  const handleUpdateQuantity = (productId: number) => {
    setSelectedProductId(productId);
    setInputValue(""); // reset input
    setModalVisible(true);
  };

  const confirmUpdate = () => {
    const quantity = parseInt(inputValue);
    if (!isNaN(quantity) && selectedProductId !== null) {
      dispatch(updateActual({ id: selectedProductId, actual: quantity }));
    }
    setModalVisible(false);
  };

  return (
    <SafeAreaView className="flex-1">
      <View className="flex-1 pt-2">
        <ScrollView
          scrollEnabled={scrollEnabled}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View className="px-5">
            {/* Header */}
            <View className="bg-[#1677ff] px-4 py-4 flex-row justify-between items-center rounded-2xl">
              <TouchableOpacity onPress={() => router.back()} className="p-2">
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <Text className="text-white font-bold text-lg">
                Xác nhận đơn nhập số{" "}
                <Text className="text-blue-200">#{id}</Text>
              </Text>
            </View>

            {/* Tìm kiếm */}
            <YStack alignItems="center" space="$2" marginTop="$4" width="100%">
              <XStack
                alignItems="center"
                backgroundColor="white"
                borderRadius="$4"
                paddingHorizontal="$3"
                flex={1}
                height="$4.5"
                width="100%"
              >
                <Ionicons name="search" size={18} color="#999" />
                <Input
                  flex={1}
                  placeholder="Tìm theo ID sản phẩm"
                  value={searchId}
                  onChangeText={setSearchId}
                  borderWidth={0}
                  paddingHorizontal="$3"
                  backgroundColor="white"
                />
              </XStack>

              <XStack width="100%" space="$2">
                <View style={{ flex: 1 }}>
                  <Button
                    fontSize={14}
                    size="$2"
                    height={38}
                    width="100%"
                    onPress={() => setFiltered(true)}
                    disabled={!searchId.trim()}
                  >
                    Tìm
                  </Button>
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    fontSize={14}
                    size="$2"
                    height={38}
                    width="100%"
                    onPress={() => {
                      setFiltered(false);
                      setSearchId("");
                    }}
                  >
                    Tắt
                  </Button>
                </View>
              </XStack>
            </YStack>

            {/* Thông tin sản phẩm */}
            <Label
              width="100%"
              textAlign="center"
              fontWeight={600}
              fontSize={15}
              marginTop={20}
            >
              Thông tin sản phẩm
            </Label>

            <Accordion
              overflow="hidden"
              width="100%"
              type="multiple"
              marginBottom="$3"
              borderRadius="$6"
              marginTop={10}
            >
              {filteredProducts.map((product, index) => (
                <Accordion.Item key={product.id} value={`product-${index}`}>
                  <Accordion.Trigger
                    flexDirection="row"
                    justifyContent="space-between"
                  >
                    {({ open }: { open: boolean }) => (
                      <>
                        <Paragraph fontWeight="500">
                          Mã sản phẩm: {product.id}
                        </Paragraph>
                        <Square
                          animation="quick"
                          rotate={open ? "180deg" : "0deg"}
                        >
                          <ChevronDown size="$1" />
                        </Square>
                      </>
                    )}
                  </Accordion.Trigger>
                  <Accordion.HeightAnimator animation="medium">
                    <Accordion.Content
                      animation="medium"
                      exitStyle={{ opacity: 0 }}
                    >
                      <Paragraph>Số lượng: {product.actual}</Paragraph>
                      <Button
                        marginTop="$2"
                        onPress={() => handleUpdateQuantity(product.id)}
                      >
                        Cập nhật số lượng
                      </Button>
                    </Accordion.Content>
                  </Accordion.HeightAnimator>
                </Accordion.Item>
              ))}
            </Accordion>
          </View>
        </ScrollView>

        {/* Nút ký xác nhận */}
        <View className="p-5">
          <TouchableOpacity
            onPress={() => router.push("/import/sign/deliver-sign")}
            className="bg-[#0d1925] px-5 py-4 rounded-full"
          >
            <Text className="text-white font-semibold text-sm text-center">
              Ký xác nhận
            </Text>
          </TouchableOpacity>
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/10 px-6">
            <View className="bg-white p-6 rounded-xl w-full">
              <Text className="text-lg font-semibold mb-2">
                Nhập số lượng mới
              </Text>
              <Input
                value={inputValue}
                onChangeText={setInputValue}
                keyboardType="numeric"
                placeholder="Nhập số lượng"
                className="border border-gray-300 p-3 rounded-md mb-4"
              />
              <View className="flex-row justify-end gap-2 mt-3">
                <Button
                  onPress={() => setModalVisible(false)}
                  className="text-gray-500 font-medium"
                >
                  Hủy
                </Button>
                <Button
                  backgroundColor="#1677ff"
                  color="white"
                  fontWeight={500}
                  onPress={confirmUpdate}
                  className="text-gray-500 font-medium"
                >
                  Cập nhật
                </Button>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default Confirm;
