import theme from "@/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingBottom: 100,
      },
      contentContainer: {
        paddingBottom: 100,
      },
    text: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.primary,
    },
    header: {
      alignItems: 'center',
      paddingVertical: 15,
    },
    agenda: {
      borderRadius: 10,
      backgroundColor: theme.colors.background,
    },
    eventCard: {
      borderBottomRightRadius: 20,
      borderTopRightRadius: 20,
      padding: 15,
      marginTop: 10,
      marginRight: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
      borderLeftWidth: 5,
    },
    eventHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 5,
    },
    dateContainer: {
      flexDirection: 'row',
      gap: 45,
      alignItems: 'center'
    },
    eventTitle: {
      fontSize: 30,
      fontWeight: 'bold',
      marginLeft: 20,
      color: theme.colors.primary
    },
    date: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.colors.primary
    },
    eventTime: {
      fontSize: 13,
      marginTop: 5,
      color: '#888',
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
      marginTop: 10,
    },
    avatar: {
      width: 25,
      height: 25,
      borderRadius: 12.5,
      marginRight: 5,
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.1)',
    },
    emptyDate: {
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'white',
      borderRadius: 10,
      marginRight: 10,
      marginTop: 20,
    },
    emptyText: {
      color: '#888',
    },
    agendaWrapper: {
      flex: 1,
      backgroundColor: theme.colors.background,
      borderRadius: 10,
      overflow: 'hidden',
      // paddingBottom: 120,
    },
    calendarContainer: {
      overflow: 'hidden',
      // backgroundColor: '#f0f0f0',
      borderRadius: 8,
      marginBottom: 10,
    },
    dragHandle: {
      height: 6,
      width: 40,
      backgroundColor: theme.colors.primary,
      alignSelf: 'center',
      borderRadius: 3,
      // marginTop: 5,
    },
    weekDatesContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 10,
    },
    weekDate: {
      fontSize: 16,
      color: theme.colors.primary,
      padding: 5,
      textAlign: 'center',
      justifyContent: 'center',
      alignItems: 'center',
    },
    selectedWeekDate: {
      backgroundColor: theme.colors.primary,
      color: 'white',
      borderRadius: 15,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    weekDateWrapper: {
      alignItems: 'center',
    },
    eventDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.primary,
      marginTop: 2,
    },
    eventRow: {
      flexDirection: 'row',
      marginBottom: 10,
      alignItems: 'center',
      marginHorizontal: 20
    },
    timeColumn: {
      width: 80,
      alignItems: 'flex-start',
    },
    timeText: {
      fontSize: 14,
      color: '#888',
      fontWeight: 'bold',
      // marginLeft: 10
    },
    eventDetails: {
      flex: 1,
      backgroundColor: 'white',
      borderRadius: 10,
      padding: 10,
      borderLeftWidth: 4,
    },
    eventName: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    weekDatesWrapper: {
      paddingBottom: 10,
      backgroundColor: 'white',
      paddingTop: 10
    },
    weekDaysContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    weekDay: {
      fontSize: 12,
      color: '#888',
      textAlign: 'center',
      width: 40,
    },
    noEventsText: {
      backgroundColor: 'white',
      borderRadius: 10,
      padding: 10,
      marginHorizontal: 20,
    },
    weekDateText: {
      fontSize: 16,
      color: theme.colors.primary,
      textAlign: 'center',
    },
    selectedWeekDateText: {
      color: 'white',
    },
  });