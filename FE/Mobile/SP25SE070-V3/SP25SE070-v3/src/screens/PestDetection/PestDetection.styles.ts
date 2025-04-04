import theme from "@/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingTop: 50
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center'
    },
    contentContainer: {
      padding: 15,
      paddingBottom: 100,
    },
    title: {
      fontSize: 24,
      fontWeight: '600',
      color: theme.colors.primary,
      marginBottom: 20,
      fontFamily: 'BalsamiqSans-Bold',
      marginTop: 38,
      
    },
    imageContainer: {
      height: 200,
      borderRadius: 10,
      backgroundColor: 'white',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    selectedImage: {
      width: '100%',
      height: '100%',
      borderRadius: 10,
    },
    placeholderText: {
      color: '#666',
      fontSize: 16,
    },
    buttonContainer: {
      flexDirection: 'column',
      // justifyContent: 'space-around',
      marginBottom: 20,
    },
    btnPhoto: {
      flexDirection: 'row',
      gap: 20,
      justifyContent: 'space-around'
    },
    button: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      // marginHorizontal: 15,
      flex: 1,
      marginTop: 10
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      textAlign: 'center',
    },
    resultTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: '#333',
      // marginBottom: 10,
      fontFamily: 'BalsamiqSans-Bold',
      marginTop: 20
    },
    resultSubTitle: {
      color: '#888',
      width: 270,
      alignItems: 'center',
      alignContent: 'center',
      textAlign: 'center',
      marginTop: 10
    },
    resultImageContainer: {
      height: 350,
      borderRadius: 50,
      marginBottom: 10,
      backgroundColor: 'white',
      alignItems: 'center',
    },
    resultImage: {
      width: '90%',
      height: '60%',
      borderRadius: 50,
      alignItems: 'center',
      marginTop: 15
    },
    resultContainer: {
      marginTop: 20
    },
    resultItem: {
      backgroundColor: '#fff',
      padding: 10,
      borderRadius: 8,
      marginBottom: 10,
      elevation: 2,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    resultText: {
      fontSize: 16,
      color: '#333',
    },
    actionButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20
    },
    actionButton: {
      backgroundColor: '#2575fc',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      flex: 1,
      marginHorizontal: 5,
    },
    actionButtonText: {
      color: '#fff',
      fontSize: 16,
      textAlign: 'center',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
      backgroundColor: '#fff',
      marginHorizontal: 20,
      padding: 20,
      borderRadius: 10,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.colors.primary,
      marginBottom: 15,
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center'
    },
    inputLabel: {
      fontSize: 16,
      color: '#333',
      marginBottom: 5,
      marginTop: 10
    },
    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 8,
      padding: 10,
      marginBottom: 15,
      fontSize: 16,
      color: '#333',
      fontFamily: theme.fonts.regular
    },
    uploadButton: {
      borderWidth: 1,
      borderColor: theme.colors.primary,
      borderRadius: 8,
      padding: 10,
      alignItems: 'center',
      marginBottom: 15,
    },
    uploadButtonText: {
      color: theme.colors.primary,
      fontSize: 16,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    modalButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      flex: 1,
      marginHorizontal: 5,
      marginTop: 10
    },
    modalButtonText: {
      color: '#fff',
      fontSize: 16,
      textAlign: 'center',
    },
    errorText: {
      color: 'red'
    }
  });