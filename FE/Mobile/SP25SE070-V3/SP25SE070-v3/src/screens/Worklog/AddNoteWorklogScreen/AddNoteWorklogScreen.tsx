import React, { useState, useRef, useEffect } from "react";
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Animated,
  Image,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { RootStackNavigationProp } from "@/constants/Types";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { ResourceItem, WorklogNoteFormData } from "@/types/worklog";
import { addNoteWorklogSchema } from "@/validations/noteWorklogSchema";
import { styles } from "./AddNoteWorklogScreen.styles";
import theme from "@/theme";
import { CustomIcon, TextCustom } from "@/components";
import { useAuthStore } from "@/store";
import { worklogService } from "@/services";
import Toast from "react-native-toast-message";

const AddNoteWorklogScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute();
  const { worklogId, historyId, initialData } = route.params as {
    worklogId: number;
    historyId?: string;
    initialData?: WorklogNoteFormData;
  };
  const { userId } = useAuthStore();

  const isEditMode = !!historyId;

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<WorklogNoteFormData>({
    resolver: yupResolver(addNoteWorklogSchema),
    defaultValues:
      isEditMode && initialData
        ? initialData
        : {
            note: "",
            issue: "",
            resources: [],
          },
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const currentResources = watch("resources") || [];
      const newResource: ResourceItem = {
        resourceID: 0,
        description: "",
        resourceURL: result.assets[0].uri,
        fileFormat: result.assets[0].type || "image/jpeg", // Lấy type từ ImagePicker
        file: "",
      };
      const newResources = [...currentResources, newResource];
      setValue("resources", newResources, { shouldValidate: true });
    }
  };

  const removeImage = (index: number) => {
    const currentResources = watch("resources") || [];
    const newResources = [...currentResources];
    newResources.splice(index, 1);
    setValue("resources", newResources, { shouldValidate: true });
  };

  const onSubmit = async (data: WorklogNoteFormData) => {
    setIsSubmitting(true);

    const payload: WorklogNoteFormData = {
      userId: Number(userId),
      workLogId: worklogId,
      note: data.note,
      issue: data.issue || "",
      resources: data.resources || [],
    };
    console.log("add worklog note", payload);
    

    try {
      console.log(
        isEditMode ? "Updating Worklog Note:" : "Adding Worklog Note:",
        payload
      );
      const res = await worklogService.addWorklogNote(payload);
      console.log("kìiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii", res);
      
      if (res.statusCode === 200) {
        Toast.show({
          type: "success",
          text1: isEditMode ? "Note updated successfully" : "Note added successfully",
        });
        navigation.goBack();
      } else {
        Toast.show({
          type: "error",
          text1: isEditMode ? "Failed to update note" : "Failed to add note",
        });
      }
    } catch (error) {
      console.error("Error submitting worklog note:", error);
      Toast.show({
        type: "error",
        text1: "An error occurred. Please try again.",
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
            <TextCustom style={styles.headerTitle}>
              {isEditMode ? "Edit Worklog Note" : "Add Worklog Note"}
            </TextCustom>
            <View style={{ width: 24 }} />
          </View>

          <Controller
            control={control}
            name="issue"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.section}>
                <TextCustom style={styles.sectionTitle}>
                  Issue (Optional)
                </TextCustom>
                <TextInput
                  style={styles.input}
                  placeholder="Describe any issues..."
                  placeholderTextColor="#999"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
                {errors.issue && (
                  <TextCustom style={styles.errorText}>
                    {errors.issue.message}
                  </TextCustom>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="note"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.section}>
                <TextCustom style={styles.sectionTitle}>
                  Note Details*
                </TextCustom>
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
                {errors.note && (
                  <TextCustom style={styles.errorText}>
                    {errors.note.message}
                  </TextCustom>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="resources"
            render={({ field: { value } }) => (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <TextCustom style={styles.sectionTitle}>
                    Attachments
                  </TextCustom>
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
                    <TextCustom style={styles.addPhotoText}>
                      Add Photo
                    </TextCustom>
                  </TouchableOpacity>
                </View>

                {(value || []).length > 0 && (
                  <View style={styles.imageGrid}>
                    {value?.map((resource: ResourceItem, index: number) => (
                      <View key={index} style={styles.imageContainer}>
                        <Image
                          source={{ uri: resource.resourceURL }}
                          style={styles.image}
                        />
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
                {errors.resources && (
                  <TextCustom style={styles.errorText}>
                    {errors.resources.message}
                  </TextCustom>
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
              <TextCustom style={styles.submitButtonText}>
                {isEditMode ? "Update Note" : "Save Note"}
              </TextCustom>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
};

export default AddNoteWorklogScreen;