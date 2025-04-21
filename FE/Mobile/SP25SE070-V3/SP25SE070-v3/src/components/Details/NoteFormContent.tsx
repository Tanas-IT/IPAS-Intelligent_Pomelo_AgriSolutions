import React from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Animated,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Video } from "expo-av";
import { ActivityIndicator } from "react-native-paper";
import { Controller, Control, FieldErrors } from "react-hook-form";
import theme from "@/theme";
import { StyleSheet } from "react-native";
import CustomIcon from "../CustomIcon";
import { NoteFormData } from "@/types";

interface NoteFormContentProps {
  control: Control<NoteFormData>;
  errors: FieldErrors<NoteFormData>;
  isSubmitting: boolean;
  isEditMode: boolean;
  isLoadingVideo: boolean;
  fadeAnim: any;
  navigation: any;
  handlePress: () => void;
  pickImage: () => void;
  pickVideo: () => void;
  removeImage: (index: number) => void;
  removeVideo: (index: number) => void;
}

const NoteFormContent: React.FC<NoteFormContentProps> = ({
  control,
  errors,
  isSubmitting,
  isEditMode,
  isLoadingVideo,
  fadeAnim,
  navigation,
  handlePress,
  pickImage,
  pickVideo,
  removeImage,
  removeVideo,
}) => {
  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={["#fffcee", "#fffcee"]}
        style={styles.gradientBackground}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity
              disabled={isSubmitting}
              onPress={() => navigation.goBack()}
            >
              <CustomIcon
                name="arrow-left"
                size={24}
                color="#064944"
                type="MaterialCommunityIcons"
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {isEditMode ? "Edit Growth Note" : "Add Growth Note"}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <Controller
            control={control}
            name="issueName"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Issue*</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Describe any plant issues..."
                  placeholderTextColor="#999"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
                {errors.issueName && (
                  <Text style={styles.errorText}>
                    {errors.issueName.message}
                  </Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="content"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Note Details*</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Write your observations..."
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={5}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
                {errors.content && (
                  <Text style={styles.errorText}>{errors.content.message}</Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="images"
            render={({ field: { value } }) => (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Attachments</Text>
                  <TouchableOpacity
                    style={styles.addPhotoButton}
                    onPress={pickImage}
                  >
                    <CustomIcon
                      name="camera"
                      size={18}
                      color="#064944"
                      type="MaterialCommunityIcons"
                    />
                    <Text style={styles.addPhotoText}>Add Photo</Text>
                  </TouchableOpacity>
                </View>

                {(value || []).length > 0 && (
                  <View style={styles.imageGrid}>
                    {value?.map((img, index) => (
                      <View key={index} style={styles.imageContainer}>
                        <Image source={{ uri: img.uri }} style={styles.image} />
                        <TouchableOpacity
                          style={styles.removeImageButton}
                          onPress={() => removeImage(index)}
                        >
                          <CustomIcon
                            name="close"
                            size={16}
                            color="white"
                            type="MaterialCommunityIcons"
                          />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
                {errors.images && (
                  <Text style={styles.errorText}>{errors.images.message}</Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="videos"
            render={({ field: { value } }) => (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Attachments</Text>
                  <TouchableOpacity
                    style={styles.addPhotoButton}
                    onPress={pickVideo}
                  >
                    <CustomIcon
                      name="video"
                      size={18}
                      color="#064944"
                      type="MaterialCommunityIcons"
                    />
                    <Text style={styles.addPhotoText}>Add Video</Text>
                  </TouchableOpacity>
                </View>
                {isLoadingVideo && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#064944" />
                  </View>
                )}
                {(value || []).length > 0 && (
                  <View style={styles.imageGrid}>
                    {value?.map((video, index) => (
                      <View key={index} style={styles.imageContainer}>
                        <Video
                          source={{ uri: video.uri }}
                          style={styles.image}
                          useNativeControls={true}
                          isLooping={false}
                        />
                        <TouchableOpacity
                          style={styles.removeImageButton}
                          onPress={() => removeVideo(index)}
                        >
                          <CustomIcon
                            name="close"
                            size={16}
                            color="white"
                            type="MaterialCommunityIcons"
                          />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
                {errors.videos && (
                  <Text style={styles.errorText}>{errors.videos.message}</Text>
                )}
              </View>
            )}
          />
        </ScrollView>

        <TouchableOpacity
          style={[
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled,
          ]}
          onPress={handlePress}
          disabled={isSubmitting}
        >
          <LinearGradient
            colors={[theme.colors.secondary, theme.colors.primary]}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#064944" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isEditMode ? "Update Note" : "Save Note"}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50,
    backgroundColor: "#fffcee",
  },
  gradientBackground: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  section: {
    marginBottom: 25,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colors.primary,
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 14,
    fontSize: 15,
    color: "#333",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  addPhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addPhotoText: {
    color: theme.colors.primary,
    marginLeft: 6,
    fontWeight: "500",
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  imageContainer: {
    width: "32%",
    aspectRatio: 1,
    marginRight: "2%",
    marginBottom: "2%",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.5)",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  submitButton: {
    position: "absolute",
    bottom: 70,
    left: 20,
    right: 20,
    borderRadius: 10,
    overflow: "hidden",
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  errorText: {
    color: "red",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    zIndex: 1,
  },
});

export default NoteFormContent;
