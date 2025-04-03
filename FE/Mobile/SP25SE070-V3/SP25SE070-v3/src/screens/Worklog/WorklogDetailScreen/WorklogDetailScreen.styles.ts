import theme from "@/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFFCEE',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#F5F7FA',
    },
    errorText: {
      fontSize: 18,
      color: '#B71C1C',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 20,
      backgroundColor: '#BCD379',
      borderBottomLeftRadius: 40,
      borderBottomRightRadius: 40,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 5,
      height: 220,
      justifyContent: 'space-between',
    },
    headerContent: {
      flex: 1,
      alignItems: 'center',
      gap: 8,
      marginLeft: 45,
      marginTop: 10
    },
    worklogName: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.colors.primary,
      textAlign: 'center',
      fontFamily: theme.fonts.regular
    },
    headerInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    worklogCode: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: '500',
      textAlign: 'center', // Căn giữa text
    },
    statusTag: {
      backgroundColor: '#FFD54F',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 16,
      alignSelf: 'center',
    },
    statusText: {
      fontSize: 12,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    dateTimeFrame: {
      flexDirection: 'row',
      backgroundColor: '#fff',
      marginHorizontal: 20,
      marginVertical: 16,
      borderRadius: 12,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      height: 80,
      marginTop: -30
    },
    dateTimeItem: {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    divider: {
      width: 1,
      backgroundColor: '#E0E0E0',
      marginVertical: 8,
    },
    dateTimeText: {
      fontSize: 16,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    markAsCompleted: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.secondary,
      borderWidth: 1,
      flexDirection: 'row',
      gap: 5,
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 15,
      width: 200,
      borderRadius: 20,
      justifyContent: 'center',
      alignSelf: 'center'
    },
    markAsCompletedText: {
      color: theme.colors.secondary
    },
    section: {
      marginHorizontal: 20,
      marginVertical: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.primary,
      marginBottom: 12,
    },
    assignCard: {
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    userCard: {
      flexDirection: 'row',
      marginBottom: 16,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      marginRight: 12,
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    userRole: {
      fontSize: 14,
      color: '#6B7280',
      marginTop: 2,
      fontWeight: '400'
    },
    userDate: {
      fontSize: 13,
      color: '#9CA3AF',
      marginTop: 2,
    },
    dividerHorizontal: {
      height: 1,
      backgroundColor: '#E0E0E0',
      marginVertical: 12,
    },
    userList: {
      marginBottom: 16,
    },
    listTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.primary,
      marginBottom: 8,
    },
    userItemHorizontal: {
      alignItems: 'center',
      marginRight: 16,
    },
    avatarSmall: {
      width: 36,
      height: 36,
      borderRadius: 18,
      marginBottom: 4,
    },
    userNameSmallHorizontal: {
      fontSize: 12,
      fontWeight: '500',
      color: '#333',
      textAlign: 'center',
      maxWidth: 60,
    },
    detailGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    detailItem: {
      width: '48%',
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      alignItems: 'center',
    },
    detailLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.primary,
      marginVertical: 4,
    },
    detailValue: {
      fontSize: 14,
      color: '#333',
      textAlign: 'center',
    },
    timelineHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
    },
    addNoteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 20,
    },
    addNoteText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 5,
    },
    timelineItem: {
      flexDirection: 'row',
      marginBottom: 20,
    },
    timelineLeft: {
      width: 40,
      alignItems: 'center',
    },
    timelineDot: {
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: theme.colors.primary,
      borderWidth: 3,
      borderColor: '#E8F5E9',
    },
    timelineLine: {
      flex: 1,
      width: 2,
      backgroundColor: '#ddd',
      marginVertical: 5,
    },
    timelineContent: {
      flex: 1,
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    timelineDateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    timelineDate: {
      fontSize: 12,
      color: '#9CA3AF',
    },
    timelineAuthor: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: '600',
    },
    createText: {
      color: '#333',
      fontWeight: '500',
      fontSize: 14,
    },
    timelineNote: {
      flexDirection: 'column',
      gap: 10,
      marginTop: 8,
    },
    timelineText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    issueText: {
      fontSize: 14,
      fontWeight: '400',
      color: '#333',
    },
    emptyContainer: {
      alignItems: 'center',
      marginTop: 20,
    },
    emptyText: {
      fontSize: 16,
      color: '#9CA3AF',
      marginTop: 10,
    },
    feedbackText: {
      fontSize: 16,
      color: '#6B7280',
      textAlign: 'center',
    },
    delBtn: {
      padding: 10,
      borderRadius: 20,
      backgroundColor: 'rgba(0,0,0,0.2)',
    },
    actionBtnContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    detailButton: {
      backgroundColor: '#BCD379',
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 6,
      alignSelf: 'flex-start',
      marginTop: 10,
    },
    detailButtonText: {
      color: theme.colors.primary,
      fontSize: 14,
      fontWeight: '500',
    },
    actionButtons: {
      flexDirection: 'row',
      alignItems: 'center',
  },
  });