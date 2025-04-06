import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { RootStackNavigationProp } from "@/constants/Types";
import { ROUTE_NAMES } from "@/constants/RouteNames";
import { styles } from "./ScanScreen.styles";

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  // const navigation = useNavigation();

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, []);

  const navigation = useNavigation<RootStackNavigationProp>();

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    // Validate and parse QR data
    if (data.startsWith("plantId:")) {
      const plantId = data.split(":")[1];
      if (plantId) {
        navigation.navigate(ROUTE_NAMES.PLANT.PLANT_DETAIL, { plantId });
      } else {
        Toast.show({
          type: "success",
          text1: "thành công",
        });
      }
    } else {
      Toast.show({
        type: "error",
        text1: "thất bại",
      });
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text>No access to camera</Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "pdf417"], // Chỉ định các loại mã vạch cần quét
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      <View style={styles.overlay}>
        <View style={styles.scanFrame} />
      </View>
      {scanned && (
        <Button title={"Tap to Scan Again"} onPress={() => setScanned(false)} />
      )}
    </View>
  );
}
