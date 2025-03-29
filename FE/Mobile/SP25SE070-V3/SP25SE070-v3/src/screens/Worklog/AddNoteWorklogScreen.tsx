import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import CustomIcon from 'components/CustomIcon';
import { RootStackNavigationProp } from '@/navigation/Types';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { ResourceItem, WorklogNoteFormData } from '@/types/worklog';
import { addNoteWorklogSchema } from '@/validations/noteWorklogSchema';


const AddNoteWorklogScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute();
  const { worklogId, historyId, initialData } = route.params as {
    worklogId: string;
    historyId?: string;
    initialData?: WorklogNoteFormData;
  };

  const isEditMode = !!historyId;

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<WorklogNoteFormData>({
    resolver: yupResolver(addNoteWorklogSchema),
    defaultValues: isEditMode && initialData ? initialData : {
      note: '',
      issue: '',
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
      const currentResources = watch('resources') || [];
      const newResource: ResourceItem = {
        resourceID: 0,
        description: '',
        resourceURL: result.assets[0].uri,
        fileFormat: 'image/jpeg',
        file: '',
      };
      const newResources = [...currentResources, newResource];
      setValue('resources', newResources, { shouldValidate: true });
    }
  };

  const removeImage = (index: number) => {
    const currentResources = watch('resources') || [];
    const newResources = [...currentResources];
    newResources.splice(index, 1);
    setValue('resources', newResources, { shouldValidate: true });
  };

  const onSubmit = async (data: WorklogNoteFormData) => {
    setIsSubmitting(true);

    const payload: WorklogNoteFormData = {
      userId: 0,
      workLogId: parseInt(worklogId),
      note: data.note,
      issue: data.issue || '',
      resources: data.resources || [],
    };

    console.log(isEditMode ? 'Updating Worklog Note:' : 'Adding Worklog Note:', payload);

    // fake
    setTimeout(() => {
      setIsSubmitting(false);
      navigation.goBack();
    }, 1500);

    // api real:
    // if (isEditMode) {
    //   await updateWorklogNote(historyId, payload);
    // } else {
    //   await addWorklogNote(payload); // POST
    // }
  };

  const handlePress = () => {
    handleSubmit(onSubmit)();
    if (Object.keys(errors).length > 0) {
      console.log('Form Errors:', errors);
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={['#fffcee', '#fffcee']}
        style={styles.gradientBackground}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <CustomIcon name="arrow-left" size={24} color="#064944" type="MaterialCommunityIcons" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {isEditMode ? 'Edit Worklog Note' : 'Add Worklog Note'}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Issue Input */}
          <Controller
            control={control}
            name="issue"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Issue (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Describe any issues..."
                  placeholderTextColor="#999"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
                {errors.issue && (
                  <Text style={styles.errorText}>{errors.issue.message}</Text>
                )}
              </View>
            )}
          />

          {/* Note Content */}
          <Controller
            control={control}
            name="note"
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
                {errors.note && (
                  <Text style={styles.errorText}>{errors.note.message}</Text>
                )}
              </View>
            )}
          />

          {/* Image Upload */}
          <Controller
            control={control}
            name="resources"
            render={({ field: { value } }) => (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Attachments</Text>
                  <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
                    <CustomIcon name="camera" size={18} color="#064944" type="MaterialCommunityIcons" />
                    <Text style={styles.addPhotoText}>Add Photo</Text>
                  </TouchableOpacity>
                </View>

                {(value || []).length > 0 && (
                  <View style={styles.imageGrid}>
                    {value?.map((resource: ResourceItem, index: number) => (
                      <View key={index} style={styles.imageContainer}>
                        <Image source={{ uri: resource.resourceURL }} style={styles.image} />
                        <TouchableOpacity
                          style={styles.removeImageButton}
                          onPress={() => removeImage(index)}
                        >
                          <CustomIcon name="close" size={16} color="white" type="MaterialCommunityIcons" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
                {errors.resources && (
                  <Text style={styles.errorText}>{errors.resources.message}</Text>
                )}
              </View>
            )}
          />
        </ScrollView>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handlePress}
          disabled={isSubmitting}
        >
          <LinearGradient
            colors={['#BCD379', '#064944']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {isSubmitting ? (
              <CustomIcon name="loading" size={24} color="white" type="MaterialCommunityIcons" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isEditMode ? 'Update Note' : 'Save Note'}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 50,
    backgroundColor: '#fffcee',
  },
  gradientBackground: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#064944',
  },
  section: {
    marginBottom: 25,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#064944',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 14,
    fontSize: 15,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addPhotoText: {
    color: '#064944',
    marginLeft: 6,
    fontWeight: '500',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  imageContainer: {
    width: '32%',
    aspectRatio: 1,
    marginRight: '2%',
    marginBottom: '2%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  errorText: {
    color: 'red',
  },
});

export default AddNoteWorklogScreen;