import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Animated,
    Image
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import CustomIcon from 'components/CustomIcon';
import { RootStackNavigationProp } from '@/navigation/Types';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { addNoteSchema } from '@/validations/noteSchemas';
import { NoteFormData } from '@/types/plant';

const AddNoteScreen: React.FC = () => {
    const navigation = useNavigation<RootStackNavigationProp>();
    const route = useRoute();
    const { plantId } = route.params as { plantId: number };

    const {
        control,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = useForm<NoteFormData>({
        resolver: yupResolver(addNoteSchema),
        defaultValues: {
            content: '',
            issueName: '',
            images: [] as string[],
        },
    });

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showImagePicker, setShowImagePicker] = useState(false);

    React.useEffect(() => {
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
            const currentImages = watch('images');
            const newImages = [...(currentImages || []), result.assets[0].uri];
            setValue('images', newImages, { shouldValidate: true });
        }
    };

    const removeImage = (index: number) => {
        const currentImages = watch('images');
        const newImages = [...(currentImages || [])];
        newImages.splice(index, 1);
        setValue('images', newImages, { shouldValidate: true });
    };

    const onSubmit = async (data: NoteFormData) => {
        console.log("loggg");

        setIsSubmitting(true);

        console.log('Submitting:', {
            ...data,
            plantId,
            noteTaker: 'Current User',
            createDate: new Date().toISOString()
        });

        setTimeout(() => {
            setIsSubmitting(false);
            navigation.goBack();
        }, 1500);
    };
    const handlePress = () => {
        console.log("hả");

        handleSubmit(onSubmit)();
        console.log("Errors:", errors);
        console.log("hủm");

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
                        <Text style={styles.headerTitle}>Addd Growth Note</Text>
                        <View style={{ width: 24 }} />
                    </View>

                    {/* Issue Input */}
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

                    {/* Note Content */}
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
                                    <Text style={styles.errorText}>
                                        {errors.content.message}
                                    </Text>
                                )}
                            </View>
                        )}
                    />

                    {/* Image Upload */}
                    <Controller
                        control={control}
                        name="images"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>Attachments</Text>
                                    <TouchableOpacity
                                        style={styles.addPhotoButton}
                                        onPress={pickImage}
                                    >
                                        <CustomIcon name="camera" size={18} color="#064944" type="MaterialCommunityIcons" />
                                        <Text style={styles.addPhotoText}>Add Photo</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* {note.images.length > 0 && (
                            <View style={styles.imageGrid}>
                                {note.images.map((uri, index) => (
                                    <View key={index} style={styles.imageContainer}>
                                        <Image source={{ uri }} style={styles.image} />
                                        <TouchableOpacity
                                            style={styles.removeImageButton}
                                            onPress={() => removeImage(index)}
                                        >
                                            <CustomIcon name="close" size={16} color="white" type="MaterialCommunityIcons" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )} */}
                                {errors.images && (
                                    <Text style={styles.errorText}>{errors.images.message}</Text>
                                )}
                                {(watch('images') || []).length > 0 && (
                                    <View style={styles.imageGrid}>
                                        {watch('images')?.map((uri, index) => (
                                            <View key={index} style={styles.imageContainer}>
                                                <Image source={{ uri }} style={styles.image} />
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
                            </View>
                        )}
                    />
                </ScrollView>

                {/* Submit Button */}
                <TouchableOpacity
                    style={[
                        styles.submitButton,
                        isSubmitting && styles.submitButtonDisabled
                    ]}
                    onPress={handlePress}
                    // onPress={handleSubmit((data) => {
                    //     console.log("SUBMIT DATA:", data); // Debug trực tiếp
                    //     onSubmit(data);
                    //   })}
                    disabled={false}
                >
                    <LinearGradient
                        // colors={['#0a7e7a', '#064944']}
                        colors={['#BCD379', '#064944']}
                        style={styles.buttonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        {isSubmitting ? (
                            <CustomIcon name="loading" size={24} color="white" type="MaterialCommunityIcons" />
                        ) : (
                            <Text style={styles.submitButtonText}>Save Note</Text>
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
        backgroundColor: '#fffcee'
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
        color: 'red'
    }
});

export default AddNoteScreen;