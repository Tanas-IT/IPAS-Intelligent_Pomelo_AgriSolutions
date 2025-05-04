import React, { useState } from "react";
import { View, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import * as ImagePicker from "expo-image-picker";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import styles from "./styles";
import { useAuthStore } from "@/store";
import { userService } from "@/services";
import { MediaFile } from "@/types";
import { LoginResponse } from "@/payloads";
import theme from "@/theme";
import { AvatarImage } from "@/components";

const AvatarUploader: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { avatarUrl, userId, roleId, accessToken, refreshToken, setAuth } =
    useAuthStore();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Toast.show({
        type: "error",
        text1: "Permission denied",
        text2: "Please allow access to photos",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
      setIsUploading(true);
      try {
        const mediaFile: MediaFile = {
          uri: result.assets[0].uri,
          name: "avatar.jpg",
          type: "image/jpeg",
        };

        const res = await userService.updateAvatarUser(
          mediaFile,
          Number(userId)
        );
        if (res.statusCode === 200 && res.data) {
          const loginResponse: LoginResponse = {
            authenModel: {
              accessToken: accessToken || "",
              refreshToken: refreshToken || "",
            },
            fullname: res.data.fullName,
            avatar: res.data.avatarURL || "",
          };

          setAuth(loginResponse, userId || "", roleId || "");
          Toast.show({ type: "success", text1: "Success", text2: res.message });
        } else {
          Toast.show({ type: "error", text1: "Error", text2: res.message });
        }
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to upload avatar",
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <TouchableOpacity
      onPress={pickImage}
      disabled={isUploading}
      onPressIn={() => (scale.value = withSpring(0.95))}
      onPressOut={() => (scale.value = withSpring(1))}
    >
      <Animated.View style={[styles.avatarWrapper, animatedStyle]}>
        {isUploading ? (
          <ActivityIndicator size="large" color="#FFD700" />
        ) : (
          <>
            <AvatarImage uri={avatarUrl} style={styles.avatar} iconSize={60} />
            <View style={styles.uploadIcon}>
              <Feather name="camera" size={20} color={theme.colors.primary} />
            </View>
          </>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default AvatarUploader;
