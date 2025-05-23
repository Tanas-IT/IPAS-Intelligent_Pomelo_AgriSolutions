import theme from "@/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fffcee',
    },
    filterContainer: {
      padding: 15,
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
    },
    filterRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    pickerWrapper: {
      flex: 1,
      marginHorizontal: 5,
    },
    filterLabel: {
      color: theme.colors.primary,
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 5,
    },
    dropdownButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 8,
    },
    dropdownText: {
      color: '#333',
      fontSize: 14,
      fontWeight: '500',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: 10,
      width: '80%',
      maxHeight: 200,
      padding: 10,
    },
    optionItem: {
      paddingVertical: 10,
      paddingHorizontal: 15,
    },
    optionText: {
      color: '#333',
      fontSize: 16,
    },
    dividerHorizontal: {
      height: 1,
      backgroundColor: '#E0E0E0',
    },
    content: {
      padding: 20,
      paddingBottom: 40,
      shadowColor: '#000000',
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    card: {
      backgroundColor: 'white',
      borderRadius: 15,
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
      overflow: 'hidden',
      marginTop: 30
    },
    tag: {
      paddingHorizontal: 25,
      paddingVertical: 10,
      borderRadius: 20,
      alignSelf: 'center',
      position: 'absolute',
      top: 10,
      zIndex: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
    },
    tagText: {
      color: theme.colors.primary,
      fontSize: 18,
      fontWeight: '700',
      textAlign: 'center',
    },
    cardContent: {
      padding: 20,
      paddingTop: 50,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    quantityBadge: {
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 25,
      borderColor: theme.colors.primary,
      borderWidth: 1,
    },
    quantityText: {
      color: theme.colors.primary,
      fontSize: 16,
      fontWeight: '300',
    },
    productType: {
      fontSize: 16,
      color: '#555',
      fontWeight: '500',
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
    },
    detailText: {
      fontSize: 16,
      color: '#333',
      marginLeft: 12,
      fontWeight: '400',
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 80,
    },
    emptyIconWrapper: {
      padding: 25,
      borderRadius: 60,
      marginBottom: 20,
    },
    emptyText: {
      color: '#777',
      fontSize: 20,
      fontWeight: '500',
    },
  });