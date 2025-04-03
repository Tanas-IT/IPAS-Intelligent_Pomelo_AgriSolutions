import theme from "@/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
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
        color: theme.colors.primary,
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
        color: theme.colors.primary,
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
        color: theme.colors.primary,
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