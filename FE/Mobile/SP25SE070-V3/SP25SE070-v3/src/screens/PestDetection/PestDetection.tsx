import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
} from "react-native";
import theme from "@/theme";
import { PestDetectionResult, PestReportRequest } from "@/types/pestDetection";
import { styles } from "./PestDetection.styles";
import LoadingScreen from "./LoadingScreen/LoadingScreen";
import { ROUTE_NAMES } from "@/constants/RouteNames";
import * as Progress from "react-native-progress";
import ReportModal from "./ReportModal/ReportModal";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import { BackButton, TextCustom } from "@/components";
import { PestDetectionService } from "@/services";
import * as FileSystem from "expo-file-system";

interface ImageFile {
  uri: string;
  type: string;
  name: string;
  size?: number;
}

const PestDetectionScreen = () => {
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null); // Lưu URL từ Cloudinary
  const [detectionResults, setDetectionResults] = useState<PestDetectionResult[] | null>(null);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const UPLOAD_PRESET = process.env.EXPO_PUBLIC_UPLOAD_PRESET;
  const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUD_NAME;

  useEffect(() => {
    if (detectionResults) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [detectionResults]);

  // Yêu cầu quyền truy cập
  const requestPermission = async (type: "library" | "camera") => {
    if (type === "library") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need camera roll permissions to make this work!");
        return false;
      }
    } else if (type === "camera") {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need camera permissions to make this work!");
        return false;
      }
    }
    return true;
  };

  const getFileSize = async (uri: string): Promise<number> => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (fileInfo.exists && "size" in fileInfo && fileInfo.size !== undefined) {
        return fileInfo.size;
      }
      console.warn("File does not exist or size is undefined:", uri);
      return 0;
    } catch (error) {
      console.error("Error getting file size:", error);
      return 0;
    }
  };

  const uploadToCloudinary = async (file: ImageFile) => {
    const MAX_FILE_SIZE = 4 * 1024 * 1024;

    const fileSize = file.size || (await getFileSize(file.uri));
    console.log("File size:", fileSize, "bytes");

    const formData = new FormData();
    formData.append("file", {
      uri: file.uri,
      type: file.type,
      name: file.name,
    } as any);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("cloud_name", CLOUD_NAME);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      console.log("Upload result:", result);
      if (result.secure_url) {
        if (fileSize > MAX_FILE_SIZE) {
          const optimizedUrl = result.secure_url.replace(
            "/upload/",
            "/upload/w_1600,q_auto,f_auto,fl_lossy/"
          );
          console.log("Optimized URL:", optimizedUrl);
          return optimizedUrl;
        }
        return result.secure_url;
      } else {
        throw new Error("Failed to upload to Cloudinary");
      }
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      throw error;
    }
  };
  const handleSelectFromLibrary = async () => {
    const hasPermission = await requestPermission("library");
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const image = result.assets[0];
      setSelectedImageUri(image.uri);
      const file: ImageFile = {
        uri: image.uri,
        type: image.mimeType || "image/jpeg",
        name: image.fileName || `photo_${Date.now()}.jpg`,
      };

      setIsLoading(true);
      try {
        const imageUrl = await uploadToCloudinary(file);
        setSelectedImageUrl(imageUrl);
        setDetectionResults(null);
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Cannot upload image to Cloudinary",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestPermission("camera");
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const image = result.assets[0];
      setSelectedImageUri(image.uri);
      const file: ImageFile = {
        uri: image.uri,
        type: image.mimeType || "image/jpeg",
        name: image.fileName || `photo_${Date.now()}.jpg`,
      };

      setIsLoading(true);
      try {
        const imageUrl = await uploadToCloudinary(file);
        setSelectedImageUrl(imageUrl);
        setDetectionResults(null);
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "The file size must be less than 4MB",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDetectPest = async () => {
    if (!selectedImageUrl) {
      alert("Please select an image or take a photo first!");
      return;
    }

    setIsLoading(true);

    try {
      console.log("payload img", selectedImageUrl);

      const response = await PestDetectionService.predictDiseaseByUrl(selectedImageUrl);
      console.log("API response:", response);

      if (response.statusCode === 200) {
        setDetectionResults(
          response.data.sort(
            (a: PestDetectionResult, b: PestDetectionResult) =>
              b.probability - a.probability
          )
        );
      } else if (response.statusCode === 500) {
        Toast.show({
          type: "error",
          text1: "Detection Failed",
          text2: "Please take a clear photo of a pomelo tree (cây bưởi)",
          visibilityTime: 4000,
          position: 'bottom'
        });
        setDetectionResults(null);
      } else {
        Toast.show({
          type: "error",
          text1: "Failed to detect pest",
          text2: response.message || "Something went wrong",
        });
      }
    } catch (error) {
      console.error("Error detecting pest:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "An error occurred while detecting pest",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedImageUri(null);
    setSelectedImageUrl(null);
    setDetectionResults(null);
    fadeAnim.setValue(0);
  };

  const handleSubmitReport = async (data: PestReportRequest) => {
    console.log("Report submitted:", data);
    try {
      const res = await PestDetectionService.createReport(data);
      if (res.statusCode === 200) {
        Toast.show({
          type: "success",
          text1: "Submit report successfully",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Duplicate Error",
          text2: res.message || "Unknown error",
        });
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "An error occurred while submitting report",
      });
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <BackButton
          targetScreen={ROUTE_NAMES.MAIN.DRAWER}
          targetParams={{
            screen: ROUTE_NAMES.MAIN.MAIN_TABS,
            params: { screen: "SplashScreen" },
          }}
          iconColor="white"
        />
        <Text style={styles.title}>Pest Detection</Text>
      </View>

      {!detectionResults ? (
        <>
          <View style={styles.imageContainer}>
            {selectedImageUri ? (
              <Image
                source={{ uri: selectedImageUri }}
                style={styles.selectedImage}
              />
            ) : (
              <TextCustom style={styles.placeholderText}>
                Haven't chosen any image yet
              </TextCustom>
            )}
          </View>

          <View style={styles.tipContainer}>
            <TextCustom style={styles.tipText}>
              <TextCustom style={{ fontWeight: 'bold' }}>Tip:</TextCustom> Please take a clear photo of pomelo fruits for accurate detection
            </TextCustom>
          </View>

          <View style={styles.buttonContainer}>
            <View style={styles.btnPhoto}>
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor: "white",
                    borderColor: theme.colors.primary,
                    borderWidth: 1,
                  },
                ]}
                onPress={handleSelectFromLibrary}
              >
                <TextCustom
                  numberOfLines={1}
                  style={[styles.buttonText, { color: theme.colors.primary }]}
                >
                  Select
                </TextCustom>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor: "white",
                    borderColor: theme.colors.primary,
                    borderWidth: 1,
                  },
                ]}
                onPress={handleTakePhoto}
              >
                <TextCustom
                  style={[styles.buttonText, { color: theme.colors.primary }]}
                >
                  Take Photo
                </TextCustom>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.button} onPress={handleDetectPest}>
              <TextCustom style={styles.buttonText}>Start Detection</TextCustom>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={[styles.resultImageContainer, theme.shadow.default]}>
            <Image
              source={{ uri: selectedImageUri! }}
              style={styles.resultImage}
            />
            <TextCustom style={styles.resultTitle}>Results</TextCustom>
            <TextCustom style={styles.resultSubTitle}>
              This result is for consultation purposes only. Reporting it as
              consumed would be inaccurate.
            </TextCustom>
          </View>
          <View style={styles.resultContainer}>
            {detectionResults.map((result, index) => (
              <View key={index} style={[styles.resultItem, theme.shadow.default]}>
                <TextCustom
                  style={styles.resultText}
                >
                  {result.tagName}
                </TextCustom>
                <View style={styles.progressContainer}>
                  <Progress.Bar
                    progress={result.probability}
                    width={270}
                    height={7}
                    color={theme.colors.primary}
                    unfilledColor={theme.colors.secondary}
                    borderColor="none"
                  />
                  <TextCustom style={styles.percentageText}>
                    {(result.probability * 100).toFixed(2)}%
                  </TextCustom>
                </View>
              </View>
            ))}
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: theme.colors.secondary },
              ]}
              onPress={() => setIsReportModalVisible(true)}
            >
              <TextCustom
                style={[
                  styles.actionButtonText,
                  { color: theme.colors.primary },
                ]}
              >
                Report
              </TextCustom>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  borderColor: theme.colors.primary,
                  backgroundColor: "white",
                  borderWidth: 1,
                },
              ]}
              onPress={handleClear}
            >
              <TextCustom
                style={[
                  styles.actionButtonText,
                  { color: theme.colors.primary },
                ]}
              >
                Clear
              </TextCustom>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      <ReportModal
        visible={isReportModalVisible}
        onClose={() => setIsReportModalVisible(false)}
        onSubmit={handleSubmitReport}
        imageUrl={selectedImageUrl}
      />
    </ScrollView>
  );
};

export default PestDetectionScreen;