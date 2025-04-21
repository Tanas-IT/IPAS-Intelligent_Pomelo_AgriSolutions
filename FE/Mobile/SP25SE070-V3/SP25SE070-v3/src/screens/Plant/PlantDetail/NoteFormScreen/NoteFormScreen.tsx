import React, { useState, useRef, useEffect } from "react";
import { Animated } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { RootStackNavigationProp } from "@/constants";
import * as ImagePicker from "expo-image-picker";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { addNoteSchema } from "@/validations/noteSchemas";
import { NoteFormContent } from "@/components";
import { PlantService } from "@/services";
import { useAuthStore } from "@/store";
import Toast from "react-native-toast-message";
import { NoteFormData } from "@/types";

const NoteFormScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute();
  const { plantId, historyId, initialData } = route.params as {
    plantId: number;
    historyId?: number;
    initialData?: NoteFormData;
  };
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);

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
            issueName: initialData.issueName || "",
            content: initialData.content || "",
            images: initialData.images || [],
            videos: initialData.videos || [],
          }
        : {
            issueName: "",
            content: "",
            images: [],
            videos: [],
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

  const pickVideo = async () => {
    setIsLoadingVideo(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets) {
        const asset = result.assets[0];
        const currentVideos = watch("videos") || [];
        const newVideo = {
          uri: asset.uri,
          type: asset.mimeType || "video/mp4",
          name: asset.fileName || `video_${Date.now()}.mp4`,
        };
        const newVideos = [...currentVideos, newVideo];
        setValue("videos", newVideos, { shouldValidate: true });
      }
    } finally {
      setIsLoadingVideo(false);
    }
  };

  const removeVideo = (index: number) => {
    const currentVideos = watch("videos") || [];
    const newVideos = [...currentVideos];
    newVideos.splice(index, 1);
    setValue("videos", newVideos, { shouldValidate: true });
  };

  const onSubmit = async (data: NoteFormData) => {
    setIsSubmitting(true);
    if (!userId) return;
    try {
      const payload = {
        plantGrowthHistoryId: historyId ?? 0,
        plantId,
        userId,
        issueName: data.issueName,
        content: data.content,
        images: data.images,
        videos: data.videos,
      };

      let response;
      if (isEditMode) {
        response = await PlantService.updatePlantGrowthHistory(payload);
      } else {
        response = await PlantService.createPlantGrowthHistory(payload);
      }

      if (response.statusCode === 200) {
        Toast.show({
          type: "success",
          text1: isEditMode
            ? "Note updated successfully"
            : "Note added successfully",
        });
        navigation.goBack();
      } else {
        Toast.show({
          type: "error",
          text1: response.message,
        });
      }
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
    <NoteFormContent
      control={control}
      errors={errors}
      isSubmitting={isSubmitting}
      isEditMode={isEditMode}
      isLoadingVideo={isLoadingVideo}
      fadeAnim={fadeAnim}
      navigation={navigation}
      handlePress={handlePress}
      pickImage={pickImage}
      pickVideo={pickVideo}
      removeImage={removeImage}
      removeVideo={removeVideo}
      // watch={watch}
    />
  );
};

export default NoteFormScreen;
