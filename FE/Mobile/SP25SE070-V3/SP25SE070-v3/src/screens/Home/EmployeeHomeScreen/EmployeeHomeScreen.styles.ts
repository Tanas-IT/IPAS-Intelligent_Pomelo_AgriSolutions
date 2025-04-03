import theme from "@/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background
    },
    contentContainer: {
      paddingBottom: 100,
    },
    header: {
      padding: 20,
      paddingTop: 50,
      borderBottomLeftRadius: 50,
      borderBottomRightRadius: 50,
      height: 130,
    },
    headerContainer: {
      // flexDirection: 'row',
      // gap: 5,
      marginTop: -10,
      marginLeft: 30
    },
    headerUserText: {
      fontSize: 28,
      fontFamily: 'BalsamiqSans-Bold',
      marginTop: -20,
      // marginLeft: 30
    },
    headerText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#888',
      fontFamily: 'BalsamiqSans-Bold'
  
    },
    headerUserName: {
      fontWeight: 'light',
      fontSize: 20
    },
    subHeaderText: {
      fontSize: 26,
      color: theme.colors.primary,
      // textShadowColor: 'black',
      marginTop: 10,
      marginLeft: 30

    },
    section: { padding: 15 },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      marginBottom: 10,
      color: '#333',
      fontFamily: "BalsamiqSans-Bold"
    },
    card: {
      backgroundColor: 'white',
      padding: 15,
      borderRadius: 10,
      marginBottom: 10,
      elevation: 3,
      flexDirection: 'column',
      justifyContent: 'space-between',
      // alignItems: 'center',
      width: 180,
      gap: 10,
      // borderLeftWidth: 3,
      // borderLeftColor: theme.colors.primary
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.primary,
    },
    time: {
      color: '#666',
    },
    cardSubtitle: {
      fontSize: 14,
      color: '#666'
    },
    detailButton: {
      backgroundColor: '#2575fc',
      paddingVertical: 5,
      paddingHorizontal: 10,
      borderRadius: 5,
    },
    detailButtonText: {
      color: '#fff',
      fontSize: 12
    },
    statsContainer: {
      flexDirection: 'row',
      gap: 10, 
      marginBottom: 10
    },
    statBox: {
      alignItems: 'center',
      backgroundColor: '#fff',
      padding: 15,
      borderRadius: 10,
      elevation: 2,
      flex: 1,
      marginHorizontal: 5,
      width: 110,
    },
    statNumber: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#333',
      marginTop: 5
    },
    statLabel: {
      fontSize: 14,
      color: '#666'
    },
    historyCard: {
      backgroundColor: '#fff',
      padding: 15,
      borderRadius: 10,
      marginBottom: 10,
      elevation: 2,
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    historyContent: {
      flex: 1,
      marginRight: 10, // Khoảng cách với badge
    },
    historyTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: '#333'
    },
    historySubtitle: {
      fontSize: 14,
      color: '#666',
      marginTop: 5,
      marginBottom: 8
    },
    statusBadgeContainer: {
      justifyContent: 'center', // Căn giữa badge theo chiều dọc
    },
    
  });