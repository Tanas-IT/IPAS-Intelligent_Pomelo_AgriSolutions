import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { TextCustom } from "@/components";

const LoadingScreen = () => {
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 700, // Tốc độ xoay
        useNativeDriver: true,
      })
    ).start();
  }, [spinAnim]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={stylesLoading.container}>
      <View style={stylesLoading.backgroundGradient} />
      <TextCustom style={stylesLoading.title}>Please wait</TextCustom>
      <Animated.View
        style={[
          stylesLoading.spinner,
          {
            transform: [{ rotate: spin }],
          },
        ]}
      >
        <View style={stylesLoading.spinnerInner} />
      </Animated.View>
      <TextCustom style={stylesLoading.description}>
        It may take a few seconds to get prediction.
      </TextCustom>
    </View>
  );
};

const stylesLoading = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A1A2A", // Nền đen-xanh đậm, đồng bộ với SplashScreen
  },
  backgroundGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#0A1A2A",
    opacity: 0.8,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 30,
    fontFamily: "BalsamiqSans-Bold",
    textShadowColor: "rgba(0, 255, 255, 0.5)", // Hiệu ứng bóng neon
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  spinner: {
    width: 48, // 3em (1em ~ 16px)
    height: 48,
    borderRadius: 24, // 50% để tròn
    borderWidth: 2,
    borderColor: "#444", // Viền xám đậm
    // Hiệu ứng bóng đổ nhiều màu (tái hiện từ CSS)
    // shadowColor: '#6359f8', // Màu chính của bóng
    shadowColor: "#BCD379", // Màu chính của bóng
    shadowOffset: { width: -10, height: -10 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10, // Để bóng đổ hiển thị trên Android
    position: "relative",
  },
  spinnerInner: {
    width: 24, // 1.5em
    height: 24,
    borderRadius: 12, // 50% để tròn
    borderWidth: 2,
    borderColor: "#444",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -12 }, { translateY: -12 }], // Căn giữa
  },
  description: {
    fontSize: 16,
    color: "#B0C4DE",
    textAlign: "center",
    marginTop: 30,
  },
});

export default LoadingScreen;
