import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import { Camera, CameraView } from "expo-camera";
import { router, useLocalSearchParams } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store"; // update path nếu khác
import { Button } from "tamagui";
import { updateProduct } from "@/redux/productSlice";
import { Dimensions } from "react-native";
import { Audio } from "expo-av";
import { useIsFocused } from "@react-navigation/native";

const { width } = Dimensions.get("window");

export default function ScanQrScreen() {
  const [beepSound, setBeepSound] = useState<Audio.Sound | null>(null);

  const { id } = useLocalSearchParams<{ id: string }>();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [lastScannedProduct, setLastScannedProduct] = useState<any | null>(
    null
  );
  const [canScan, setCanScan] = useState(true);
  const isFocused = useIsFocused();
  const scanInProgress = useRef(false);

  const importOrderId = useSelector(
    (state: RootState) => state.paper.importOrderId
  );

  const products = useSelector((state: RootState) =>
    state.product.products.filter(
      (p) => String(p.importOrderId) === importOrderId
    )
  );
  const dispatch = useDispatch();
  const productsScanned = products.filter((p) => p.actual > 0).length;

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  useEffect(() => {
    const loadBeep = async () => {
      const { sound } = await Audio.Sound.createAsync(
        require("@/assets/beep-07a.mp3")
      );
      setBeepSound(sound);
    };

    loadBeep();

    return () => {
      beepSound?.unloadAsync(); // cleanup khi unmount
    };
  }, []);

  const playBeep = async () => {
    try {
      if (beepSound) {
        await beepSound.stopAsync(); // dừng nếu đang phát
        await beepSound.setPositionAsync(0); // quay lại đầu
        await beepSound.playAsync(); // phát lại
      }
    } catch (err) {
      console.warn("Không thể phát âm thanh:", err);
    }
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (!isFocused || !canScan || scanInProgress.current) return;

    scanInProgress.current = true;
    setCanScan(false); // chặn thêm

    try {
      const qrData = JSON.parse(decodeURIComponent(data));
      const foundProduct = products.find(
        (product) => product.id === String(qrData.id)
      );

      if (!foundProduct) {
        Alert.alert("⚠️ Sản phẩm không có trong đơn nhập.");
        scanInProgress.current = false;
        setCanScan(true);
        return;
      }

      await playBeep();

      dispatch(
        updateProduct({
          id: foundProduct.id,
          actual: foundProduct.actual + 1,
        })
      );

      setLastScannedProduct({
        ...foundProduct,
        actual: foundProduct.actual + 1,
      });

      setTimeout(() => {
        setLastScannedProduct(null);
        scanInProgress.current = false;
        setCanScan(true);
      }, 2000);
    } catch (error) {
      Alert.alert("❌ Mã QR không hợp lệ.");
      scanInProgress.current = false;
      setCanScan(true);
    }
  };

  // Bấm tiếp tục
  const handleScanAgain = () => {
    setError(null);
    setLastScannedProduct(null);
    setIsScanning(true); // Cho phép scan lại
  };
  const handleManualEntry = () => {
    console.log("importOrderId", importOrderId);
    router.push(`/import/confirm-manual/${importOrderId}`);
  };

  const handleConfirm = () => {
    if (lastScannedProduct?.id) {
      router.push({
        pathname: "/import/detail-product/[id]",
        params: { id: lastScannedProduct.id.toString() },
      });
    } else {
      Alert.alert("Không thể điều hướng", "Không tìm thấy mã sản phẩm.");
    }
  };

  if (hasPermission === null) return <Text>Đang xin quyền camera...</Text>;
  if (hasPermission === false) return <Text>Không có quyền dùng camera</Text>;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View className="flex-row items-center">
          <Button onPress={() => router.back()}>←</Button>
          <Text style={styles.headerTitle}>Quét QR</Text>
        </View>
        <Button onPress={handleManualEntry}>Nhập thủ công</Button>
      </View>

      {/* Camera full màn dưới header */}
      <View style={styles.cameraWrapper}>
        <CameraView
          barcodeScannerSettings={{
            barcodeTypes: ["qr", "ean13", "code128"],
          }}
          onBarcodeScanned={handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Thanh trạng thái quét */}
        {/* <View
          style={[
            styles.scanStatus,
            {
              backgroundColor: remainingProducts === 0 ? "#2ECC71" : "#E74C3C",
            },
          ]}
        >
          <Text style={styles.scanStatusText}>
            Đã quét: {productsScanned}/{totalProductsToScan}
          </Text>
        </View> */}

        {/* Thông tin sản phẩm vừa quét */}
        {lastScannedProduct && (
          <View style={styles.bottomBox}>
            <View style={styles.productBox}>
              <View style={{ flex: 1 }}>
                <Text style={styles.productTitle}>
                  {lastScannedProduct.id} - ({lastScannedProduct.actual}/
                  {lastScannedProduct.expect})
                </Text>
                <Text style={styles.productName}>
                  {lastScannedProduct.name}
                </Text>
              </View>

              <View className="flex-row">
                {/* <Button
                  onPress={handleScanAgain}
                  style={[styles.confirmButton, { marginLeft: 10 }]}
                  backgroundColor="#f0f0f0"
                >
                  →
                </Button> */}

                <Button
                  backgroundColor="#1677ff"
                  color="white"
                  fontWeight="500"
                  onPress={handleConfirm}
                  style={[styles.confirmButton, { marginLeft: 10 }]}
                >
                  Xác nhận
                </Button>
              </View>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    height: 60,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderColor: "#eee",
    zIndex: 20,
  },
  headerTitle: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: "bold",
  },
  cameraWrapper: {
    flex: 1,
    position: "relative",
  },
  scanStatus: {
    top: 16,
    paddingVertical: 13,
    marginHorizontal: 20,
    borderRadius: 5,
    zIndex: 10,
    position: "absolute",

    width: width - 40,
    alignItems: "center",
  },
  scanStatusText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  bottomBox: {
    position: "absolute",
    bottom: 30,
    width: "100%",
    paddingHorizontal: 20,
    zIndex: 10,
  },

  productBox: {
    flexDirection: "row", // <-- Hiển thị theo hàng ngang
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 5,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },

  productTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  productName: {
    fontSize: 14,
    color: "#555",
  },
  confirmButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
});
