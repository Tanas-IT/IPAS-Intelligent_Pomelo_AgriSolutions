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

const PestDetectionScreen = () => {
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null); // uri để hiển thị
  const [selectedImageFile, setSelectedImageFile] = useState<any | null>(null);
  const [detectionResults, setDetectionResults] = useState<
    PestDetectionResult[] | null
  >(null);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
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
      setSelectedImageUri(image.uri); // uri để hiển thị
      // format form file
      const file = {
        uri: image.uri,
        type: image.mimeType || "image/jpeg", // MIME type mặc định là jpeg nếu không có
        name: image.fileName || `photo_${Date.now()}.jpg`, // tên file default
      };
      setSelectedImageFile(file);
      setDetectionResults(null);
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
      const file = {
        uri: image.uri,
        type: image.mimeType || "image/jpeg",
        name: image.fileName || `photo_${Date.now()}.jpg`,
      };
      setSelectedImageFile(file);
      setDetectionResults(null);
    }
  };

  const handleDetectPest = async () => {
    if (!selectedImageFile) {
      alert("Please select an image from your phone or take a photo before!");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const mockResponse: PestDetectionResult[] = [
        {
          probability: 0.95363975,
          tagId: "d28190cb-04ca-4513-91fe-748a5c3a14b8",
          tagName: "Bệnh sẹo/ghẻ",
          tagType: "Regular",
        },
        {
          probability: 0.020478763,
          tagId: "84b6ff11-7406-40cd-8e66-9500179789d5",
          tagName: "Bệnh do nhện đỏ",
          tagType: "Regular",
        },
        {
          probability: 0.018365679,
          tagId: "2cfd18f9-3c15-4ddc-aa56-436ab99f0e13",
          tagName: "Bệnh do rệp sáp",
          tagType: "Regular",
        },
        {
          probability: 0.004259581,
          tagId: "f42a7d49-3c89-458a-94bd-27fb693dd250",
          tagName: "Bệnh loét",
          tagType: "Regular",
        },
      ];

      setDetectionResults(
        mockResponse.sort((a, b) => b.probability - a.probability)
      );
      setIsLoading(false);
    }, 5000);

    // try {
    //   // call api

    //   const response = await pestDetectionService.predictDisease(selectedImageFile);
    //   if (response.statusCode === 200) {
    //     setDetectionResults(response.data.sort((a: PestDetectionResult, b: PestDetectionResult) => b.probability - a.probability));
    //   } else {
    //     Toast.show({
    //       type: 'error',
    //       text1: 'Failed to detect pest',
    //       text2: response.message || 'Something went wrong',
    //     });
    //   }
    // } catch (error) {
    //   console.error('Error detecting pest:', error);
    //   Toast.show({
    //     type: 'error',
    //     text1: 'Error',
    //     text2: 'An error occurred while detecting pest',
    //   });
    // } finally {
    //   setIsLoading(false);
    // }
  };

  const handleClear = () => {
    setSelectedImageUri(null);
    setSelectedImageFile(null);
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
          text1: "Some errors occur",
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
            <Text style={styles.resultTitle}>Results</Text>
            <Text style={styles.resultSubTitle}>
              This result is for consultation purposes only. Reporting it as
              consumed would be inaccurate.
            </Text>
          </View>
          <View style={styles.resultContainer}>
            {detectionResults.map((result, index) => (
              <View
                key={index}
                style={[styles.resultItem, theme.shadow.default]}
              >
                <TextCustom style={styles.resultText}>
                  {result.tagName}
                </TextCustom>
                <Progress.Bar
                  progress={result.probability}
                  width={150}
                  height={7}
                  color={theme.colors.primary}
                  unfilledColor={theme.colors.secondary}
                  borderColor="none"
                />
                <TextCustom>
                  {(result.probability * 100).toFixed(2)}%
                </TextCustom>
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
      />
    </ScrollView>
  );
};

export default PestDetectionScreen;
