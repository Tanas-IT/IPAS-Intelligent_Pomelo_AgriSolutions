import theme from "@/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: 10,
    },
    addButton: {
      position: 'absolute',
      bottom: 20,
      right: 20,
      backgroundColor: theme.colors.btnYellow,
      borderRadius: 30,
      width: 60,
      height: 60,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 5,
      zIndex: 10,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 50,
    },
    emptyText: {
      fontSize: 16,
      color: '#666',
      marginTop: 10,
    },
    dateGroup: {
        flexDirection: 'row',
        marginBottom: 20,
      },
      timelineLeft: {
        width: 60,
        alignItems: 'center',
      },
      dateText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.colors.primary,
        marginBottom: 5,
      },
      timelineDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: theme.colors.btnYellow,
        borderWidth: 2,
        borderColor: theme.colors.primary,
      },
      timelineLine: {
        flex: 1,
        width: 2,
        backgroundColor: theme.colors.primary,
        marginTop: 5,
      },
      recordsContainer: {
        flex: 1,
      },
  });