import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import theme from "@/theme";
import { ROUTE_NAMES } from "@/constants/RouteNames";
import { RootStackNavigationProp } from "@/constants/Types";
import { LinearGradient } from "expo-linear-gradient";
import { AI2 } from "@/assets/images";
import { TextCustom } from "@/components";

const { width: screenWidth } = Dimensions.get("window");

const SplashScreen = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const bounceAnim = useRef(new Animated.Value(0)).current; // lên xuống
  const glowAnim = useRef(new Animated.Value(0)).current; // tỏa sáng
  const fadeAnim = useRef(new Animated.Value(0)).current; // Fade-in cho hình ảnh
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 10,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [bounceAnim]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [glowAnim]);

  useEffect(() => {
    if (imageLoaded) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300, // Fade-in trong 0.3 giây
        useNativeDriver: true,
      }).start();
    }
  }, [imageLoaded, fadeAnim]);

  const handleGetStarted = () => {
    navigation.navigate(ROUTE_NAMES.PEST_DETECTION.PEST_DETECTION);
  };

  return (
    <View style={stylesSplash.container}>
      <View style={stylesSplash.backgroundGradient} />

      <Animated.View
        style={[
          stylesSplash.robotContainer,
          {
            transform: [{ translateY: bounceAnim }],
            shadowOpacity: glowAnim,
            shadowColor: theme.colors.primary,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 0 },
          },
        ]}
      >
        {!imageLoaded && <View style={stylesSplash.imagePlaceholder} />}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Image
            source={AI2}
            style={stylesSplash.robotImage}
            resizeMode="contain"
            fadeDuration={0}
            onLoad={() => setImageLoaded(true)} // Khi hình ảnh tải xong
          />
        </Animated.View>
      </Animated.View>

      <TextCustom style={stylesSplash.title}>AI Pest Detectionn</TextCustom>
      <TextCustom style={stylesSplash.description}>
        Identify diseases on grapefruit trees quickly and accurately.
      </TextCustom>

      <TouchableOpacity onPress={handleGetStarted}>
        <LinearGradient
          colors={[
            theme.colors.secondary,
            `${theme.colors.primary}80`,
            theme.colors.secondary,
          ]} // Gradient: secondary -> primary nhạt -> secondary
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={stylesSplash.getStartedButton}
        >
          <TextCustom style={stylesSplash.getStartedText}>
            Get Started
          </TextCustom>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const stylesSplash = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0A1A2A",
    marginBottom: Platform.OS === "ios" ? 0 : 40,
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
  robotContainer: {
    marginBottom: 30,
    position: "relative",
    elevation: 5,
    marginTop: -200,
  },
  robotImage: {
    width: screenWidth * 0.6,
    borderRadius: 75,
  },
  glowEffect: {
    position: "absolute",
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 85,
    borderWidth: 5,
    borderColor: theme.colors.primary,
    opacity: 0.5,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
    fontFamily: "BalsamiqSans-Bold",
    textShadowColor: "rgba(0, 255, 255, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    marginTop: -150,
  },
  description: {
    fontSize: 16,
    color: "#B0C4DE",
    textAlign: "center",
    marginHorizontal: 30,
    marginBottom: 40,
  },
  getStartedButton: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 25,
    elevation: 5,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  getStartedText: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
  imagePlaceholder: {
    position: "absolute",
    marginTop: 150,
    width: screenWidth * 0.6,
    height: screenWidth * 0.6,
    backgroundColor: "#1E2A3A",
  },
});

export default SplashScreen;
