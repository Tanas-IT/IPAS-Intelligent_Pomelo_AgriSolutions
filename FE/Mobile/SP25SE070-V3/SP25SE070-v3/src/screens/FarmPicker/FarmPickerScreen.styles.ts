import theme from "@/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fffcee',
      padding: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.primary,
      marginBottom: 24,
      textAlign: 'center',
      marginTop: 20
    },
    scrollContainer: {
      paddingBottom: 20,
    },
    cardContainer: {
      marginBottom: 40,
      alignItems: 'center',
    },
    imageContainer: {
      width: 90,
      height: 90,
      borderRadius: 45,
      borderWidth: 3,
      borderColor: 'white',
      backgroundColor: 'white',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
      zIndex: 1,
      marginBottom: -30,
    },
    farmImage: {
      width: '100%',
      height: '100%',
      borderRadius: 45,
    },
    card: {
      width: '100%',
      backgroundColor: 'white',
      borderRadius: 12,
      padding: 20,
      paddingTop: 40,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    inactiveCard: {
      opacity: 0.7,
    },
    cardContent: {
      paddingTop: 10,
    },
    farmName: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.primary,
      textAlign: 'center',
      marginBottom: 16,
    },
    addressContainer: {
      marginBottom: 16,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#ecf0f1',
    },
    addressText: {
      fontSize: 14,
      color: '#7f8c8d',
      textAlign: 'center',
      marginBottom: 4,
    },
    statsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 16,
    },
    statItem: {
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#27ae60',
    },
    statLabel: {
      fontSize: 14,
      color: '#7f8c8d',
      marginTop: 4,
    },
    infoContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    infoItem: {
      alignItems: 'center',
    },
    infoLabel: {
      fontSize: 14,
      color: '#7f8c8d',
      marginBottom: 4,
    },
    infoValue: {
      fontSize: 16,
      fontWeight: '500',
      color: '#2c3e50',
    },
    statusText: {
      fontSize: 16,
      fontWeight: '500',
    },
    activeStatus: {
      color: '#27ae60',
    },
    inactiveStatus: {
      color: '#e74c3c',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    roleText: {
      fontSize: 14,
      color: '#3498db',
      fontWeight: '500',
    },
    dateText: {
      fontSize: 12,
      color: '#7f8c8d',
    },
    statusTag: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      fontSize: 12,
      overflow: 'hidden',
      alignSelf: 'flex-start',
    },
    owner: {
      backgroundColor: '#E6F7FF',
      color: '#1890FF',
      borderWidth: 1,
      borderColor: '#91D5FF',
    },
    manager: {
      backgroundColor: '#F9F0FF',
      color: '#722ED1',
      borderWidth: 1,
      borderColor: '#D3ADF7',
    },
    employee: {
      backgroundColor: '#F6FFED',
      color: '#52C41A',
      borderWidth: 1,
      borderColor: '#B7EB8F',
    },
    other: {
      backgroundColor: '#FAFAFA',
      color: '#666666',
      borderWidth: 1,
      borderColor: '#D9D9D9',
    }
  });