import theme from "@/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fffcee',
    },
    content: {
      padding: 15,
      paddingBottom: 30,
    },
    card: {
      backgroundColor: 'white',
      borderRadius: 10,
      padding: 15,
      marginBottom: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      marginTop: 20
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    dateBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FF9800',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 12,
    },
    dateText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '500',
      marginLeft: 5,
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 3,
      borderRadius: 12,
    },
    healthyStatus: {
      backgroundColor: '#4CAF50',
    },
    usedStatus: {
      backgroundColor: '#2196F3',
    },
    issuedStatus: {
      backgroundColor: '#F44336',
    },
    statusText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '500',
    },
    plantName: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
      marginBottom: 5,
    },
    plantCode: {
      fontSize: 14,
      color: '#666',
      marginBottom: 10,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    detailText: {
      fontSize: 14,
      color: '#555',
      marginLeft: 8,
    },
    detailButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginTop: 10,
    },
    detailButtonText: {
      color: theme.colors.primary,
      fontWeight: '500',
      marginRight: 5,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40,
    },
    emptyText: {
      marginTop: 15,
      color: '#999',
      fontSize: 16,
    },
    tagContainer: {
      alignItems: 'center',
      marginBottom: 15,
      zIndex: 10,
      shadowColor: '#000000',
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
      marginTop: -30
    },
    tag: {
      backgroundColor: '#4CAF50',
      paddingHorizontal: 20,
      paddingVertical: 6,
      borderRadius: 20,
      shadowColor: '#000000',
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    tagText: {
      color: theme.colors.primary,
      fontSize: 16,
      fontWeight: 'bold',
    },
  });