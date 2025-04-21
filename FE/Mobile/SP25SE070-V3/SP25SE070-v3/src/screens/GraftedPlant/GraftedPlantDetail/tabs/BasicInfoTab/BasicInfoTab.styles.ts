import theme from "@/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    tagContainer: {
      alignItems: 'center',
      marginBottom: -25,
      zIndex: 10,
      shadowColor: '#000000',
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
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
    card: {
      backgroundColor: 'white',
      borderRadius: 12,
      padding: 40,
      marginTop: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    label: {
      fontSize: 14,
      color: '#666',
      marginLeft: 8,
      marginRight: 4,
      width: 100,
    },
    value: {
      flex: 1,
      fontSize: 14,
      color: '#333',
      fontWeight: '500',
    },
    descriptionText: {
      fontSize: 14,
      color: '#444',
      lineHeight: 22,
    },
  });