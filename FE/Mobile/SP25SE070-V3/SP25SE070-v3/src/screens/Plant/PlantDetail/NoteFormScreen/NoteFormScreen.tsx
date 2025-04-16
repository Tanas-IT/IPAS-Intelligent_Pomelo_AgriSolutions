import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Animated,
  Image,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { RootStackNavigationProp } from "@/constants";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { addNoteSchema } from "@/validations/noteSchemas";
import { styles } from "./NoteFormScreen.styles";
import theme from "@/theme";
import { CustomIcon } from "@/components";
import { PlantService } from "@/services";
import { useAuthStore } from "@/store";
import Toast from "react-native-toast-message";

export interface NoteFormData {
  content: string;
  issueName?: string;
  images?: { uri: string; type: string; name: string }[];
}

const NoteFormScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute();
  const { plantId, historyId, initialData } = route.params as {
    plantId: number;
    historyId?: number;
    initialData?: NoteFormData;
  };

  const isEditMode = !!historyId;

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<NoteFormData>({
    resolver: yupResolver(addNoteSchema),
    defaultValues:
      isEditMode && initialData
        ? {
            content: initialData.content || "",
            issueName: initialData.issueName || "",
            images: initialData.images || [],
          }
        : {
            content: "",
            issueName: "",
            images: [],
          },
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userId } = useAuthStore();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      const asset = result.assets[0];
      const currentImages = watch("images") || [];
      const newImage = {
        uri: asset.uri,
        type: asset.mimeType || "image/jpeg",
        name: asset.fileName || `photo_${Date.now()}.jpg`,
      };
      const newImages = [...currentImages, newImage];
      setValue("images", newImages, { shouldValidate: true });
    }
  };

  const removeImage = (index: number) => {
    const currentImages = watch("images") || [];
    const newImages = [...currentImages];
    newImages.splice(index, 1);
    setValue("images", newImages, { shouldValidate: true });
  };

  const onSubmit = async (data: NoteFormData) => {
    setIsSubmitting(true);

    try {
      const payload = {
        plantId,
        userId,
        issueName: data.issueName,
        content: data.content,
        images: data.images,
      };

      console.log(isEditMode ? "Updating Note:" : "Adding Note:", payload);

      const response = await PlantService.createPlantGrowthHistory(payload);
      if (response.statusCode === 200) {
        Toast.show({
          type: "success",
          text1: isEditMode ? "Note updated successfully" : "Note added successfully",
        });
        navigation.goBack();
      } else {
        throw new Error(response.message || "API error");
      }
    } catch (error: any) {
      console.error("Error submitting note:", {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
        status: error.response?.status,
      });

    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePress = () => {
    handleSubmit(onSubmit)();
    if (Object.keys(errors).length > 0) {
      console.log("Form Errors:", errors);
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={["#fffcee", "#fffcee"]}
        style={styles.gradientBackground}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
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
                <Text style={styles.sectionTitle}>Issue (Optional)</Text>
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
              <CustomIcon
                name="loading"
                size={24}
                color="white"
                type="MaterialCommunityIcons"
              />
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

export default NoteFormScreen;