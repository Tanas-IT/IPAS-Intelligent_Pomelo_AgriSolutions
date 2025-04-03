import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fffcee',
    },
    eventCard: {
      borderRadius: 10,
      padding: 10,
      marginVertical: 5,
      borderLeftWidth: 4,
      elevation: 2,
      position: 'absolute',
    },
    eventHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 5,
    },
    eventTitle: {
      fontSize: 13,
      fontWeight: 'bold',
      flex: 1,
    },
    eventTime: {
      fontSize: 13,
      color: '#666',
      marginTop: 5,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
      backgroundColor: 'rgba(255,255,255,0.3)',
    },
    statusText: {
      fontSize: 12,
      fontWeight: '500',
      textTransform: 'capitalize',
    },
    avatarList: {
      marginTop: 5,
    },
    avatar: {
      width: 25,
      height: 25,
      borderRadius: 12.5,
      marginRight: 5,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.1)',
    },
  });