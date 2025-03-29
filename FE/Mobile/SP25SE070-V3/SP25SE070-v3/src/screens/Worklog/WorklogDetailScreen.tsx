import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { RootStackNavigationProp, WorklogDetailScreenProps } from '@/navigation/Types';
import { useNavigation } from '@react-navigation/native';
import CustomIcon from 'components/CustomIcon';
import BackButton from 'components/BackButton';
import { ROUTE_NAMES } from '@/navigation/RouteNames';

const mockWorklog = {
  workLogId: 2,
  workLogCode: 'WL-11',
  status: 'Not Started',
  workLogName: 'Watering on Plot A',
  planName: 'Kế hoạch chăm sóc cây',
  processName: 'Tưới nhỏ giọt',
  masterTypeName: 'Watering',
  date: '2025-03-25T07:00:00',
  actualStartTime: '07:00:00',
  actualEndTime: '08:00:00',
  isConfirm: false,
  listEmployee: [
    {
      userId: 2,
      fullName: 'Jane Smith',
      avatarURL: 'https://res.cloudinary.com/dgshx4n2c/image/upload/v1741755465/ppgzlr8a9fdf5kxbo3uv.png',
      statusOfUserWorkLog: 'Replaced',
    },
    {
      userId: 8,
      fullName: 'Charlie Davis',
      avatarURL: 'https://res.cloudinary.com/dgshx4n2c/image/upload/v1741755864/pw8jyieauzsacwbae9gg.png',
      statusOfUserWorkLog: 'Replaced',
    },
  ],
  reporter: [
    {
      userId: 6,
      fullName: 'Ai Giao',
      avatarURL: 'https://res.cloudinary.com/dgshx4n2c/image/upload/v1741755628/hikdhs0nnj9l6zkqbjje.jpg',
      statusOfUserWorkLog: 'Received',
    },
  ],
  planTargetModels: [
    {
      landPlotId: 1,
      landPlotName: 'Plot A',
      rows: [],
      graftedPlants: [],
      plantLots: [],
      plants: [],
    },
  ],
  typeWork: 'Tưới nhỏ giọt',
  listGrowthStageName: ['Seedling Stage'],
  listTaskFeedback: [],
  listNoteOfWorkLog: [
    {
      notes: 'ooooo',
      fullName: 'Jane Smith',
      avatarURL: 'https://res.cloudinary.com/dgshx4n2c/image/upload/v1741755465/ppgzlr8a9fdf5kxbo3uv.png',
      issue: 'ppppp',
      userId: 2,
      listResources: [],
    },
    {
      notes: 'kkkkkk',
      fullName: 'The Tam',
      avatarURL: 'https://res.cloudinary.com/dgshx4n2c/image/upload/v1741755512/gkk4m8onahfl8dacc4qf.png',
      issue: 'llll',
      userId: 4,
      listResources: [],
    },
    {
      notes: 'iiiiiiiii',
      fullName: 'Ai Giao',
      avatarURL: 'https://res.cloudinary.com/dgshx4n2c/image/upload/v1741755628/hikdhs0nnj9l6zkqbjje.jpg',
      issue: 'mmmm',
      userId: 6,
      listResources: [],
    },
  ],
  replacementEmployee: [
    {
      userId: 10,
      fullName: 'Ethan Wilson',
      avatar: 'https://res.cloudinary.com/dgshx4n2c/image/upload/v1741755864/pw8jyieauzsacwbae9gg.png',
      replaceUserId: 2,
      replaceUserFullName: 'Jane Smith',
      replaceUserAvatar: 'https://res.cloudinary.com/dgshx4n2c/image/upload/v1741755465/ppgzlr8a9fdf5kxbo3uv.png',
    },
    {
      userId: 2,
      fullName: 'Jane Smith',
      avatar: 'https://res.cloudinary.com/dgshx4n2c/image/upload/v1741755465/ppgzlr8a9fdf5kxbo3uv.png',
      replaceUserId: 10,
      replaceUserFullName: 'Ethan Wilson',
      replaceUserAvatar: 'https://res.cloudinary.com/dgshx4n2c/image/upload/v1741755864/pw8jyieauzsacwbae9gg.png',
    },
  ],
};

interface WorklogDetail {
  workLogId: number;
  workLogCode: string;
  status: string;
  workLogName: string;
  planName: string;
  processName: string;
  masterTypeName: string;
  date: string;
  actualStartTime: string;
  actualEndTime: string;
  isConfirm: boolean;
  listEmployee: { userId: number; fullName: string; avatarURL: string; statusOfUserWorkLog: string }[];
  reporter: { userId: number; fullName: string; avatarURL: string; statusOfUserWorkLog: string }[];
  planTargetModels: { landPlotId: number; landPlotName: string }[];
  typeWork: string;
  listGrowthStageName: string[];
  listTaskFeedback: any[];
  listNoteOfWorkLog: {
    notes: string;
    fullName: string;
    avatarURL: string;
    issue: string;
    userId: number;
    listResources: any[];
  }[];
  replacementEmployee: {
    userId: number;
    fullName: string;
    avatar: string;
    replaceUserId: number;
    replaceUserFullName: string;
    replaceUserAvatar: string;
  }[];
}

const WorklogDetailScreen: React.FC<WorklogDetailScreenProps> = ({ route }) => {
  const { worklogId } = route.params;
  const navigation = useNavigation<RootStackNavigationProp>();
  const [worklog, setWorklog] = useState<WorklogDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorklogDetail = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setWorklog(mockWorklog);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching mock worklog detail:', error);
        setLoading(false);
      }
    };

    fetchWorklogDetail();
  }, [worklogId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#064944" />
      </View>
    );
  }

  if (!worklog) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Worklog not found</Text>
      </View>
    );
  }

  const handleCancelWorklog = () => {
    // Logic hủy worklog (gọi API hoặc xử lý)
    console.log('Cancel worklog:', worklog.workLogId);
    // Ví dụ: navigation.goBack() sau khi hủy
  };

  const handleAddNote = () => {
    // Điều hướng sang AddNoteWorklogScreen và truyền worklogId
    navigation.navigate(ROUTE_NAMES.WORKLOG.ADD_NOTE_WORKLOG, { worklogId: worklog.workLogId.toString() });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{marginTop: -100}}>
        <BackButton
          targetScreen={ROUTE_NAMES.MAIN.DRAWER}
          targetParams={{
            screen: ROUTE_NAMES.MAIN.MAIN_TABS,
            params: { screen: 'Worklog' }
          }}
          iconColor="white"
        />
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.worklogName}>{worklog.workLogName}</Text>
          {/* <View style={styles.headerInfo}> */}
          <Text style={styles.worklogCode}>Code: {worklog.workLogCode}</Text>
          <View style={styles.statusTag}>
            <Text style={styles.statusText}>{worklog.status}</Text>
          </View>
          {/* </View> */}
        </View>

        <TouchableOpacity onPress={handleCancelWorklog} style={styles.delBtn}>
          <CustomIcon
            name="delete"
            size={24}
            color="red"
            type="MaterialCommunityIcons"
          />
        </TouchableOpacity>
      </View>

      {/* Date and Time Frame */}
      <View style={styles.dateTimeFrame}>
        <View style={styles.dateTimeItem}>
          <CustomIcon
            name="calendar"
            size={20}
            color="#064944"
            type="MaterialCommunityIcons"
          />
          <Text style={styles.dateTimeText}>
            {new Date(worklog.date).toLocaleDateString('vi-VN')}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.dateTimeItem}>
          <CustomIcon
            name="clock-outline"
            size={20}
            color="#064944"
            type="MaterialCommunityIcons"
          />
          <Text style={styles.dateTimeText}>
            {worklog.actualStartTime} - {worklog.actualEndTime}
          </Text>
        </View>
      </View>

      {/* Assign Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Assign Information</Text>
        <View style={styles.assignCard}>
          <View style={styles.userCard}>
            <Image
              source={{ uri: worklog.reporter[0]?.avatarURL }}
              style={styles.avatar}
            />
            <View style={styles.userInfo}>
              <View style={{flexDirection: 'row', gap: 7}}>
              <Text style={styles.userName}>{worklog.reporter[0]?.fullName}</Text>
              <Text style={styles.userRole}>created this plan</Text>
              </View>
              <Text style={styles.userDate}>
                {new Date(worklog.date).toLocaleDateString('vi-VN')}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.dividerHorizontal} />

          {/* Danh sách Assigned To */}
          <View style={styles.userList}>
            <Text style={styles.listTitle}>Assigned To:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {worklog.listEmployee.map((employee) => (
                <View key={employee.userId} style={styles.userItemHorizontal}>
                  <Image source={{ uri: employee.avatarURL }} style={styles.avatarSmall} />
                  <Text style={styles.userNameSmallHorizontal}>{employee.fullName}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Danh sách Reporter */}
          <View style={styles.userList}>
            <Text style={styles.listTitle}>Reporter:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.userItemHorizontal}>
                <Image
                  source={{ uri: worklog.reporter[0]?.avatarURL }}
                  style={styles.avatarSmall}
                />
                <Text style={styles.userNameSmallHorizontal}>{worklog.reporter[0]?.fullName}</Text>
              </View>
            </ScrollView>
          </View>

          {/* Danh sách Replacement */}
          <View style={styles.userList}>
            <Text style={styles.listTitle}>Replacement:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {worklog.replacementEmployee.map((replacement, index) => (
                <View key={index} style={styles.userItemHorizontal}>
                  <Image source={{ uri: replacement.avatar }} style={styles.avatarSmall} />
                  <Text style={styles.userNameSmallHorizontal}>{replacement.fullName}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>

      {/* Detail Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detail</Text>
        <View style={styles.detailGrid}>
          <View style={styles.detailItem}>
            <CustomIcon name="sprout" size={20} color="#064944" type="MaterialCommunityIcons" />
            <Text style={styles.detailLabel}>Crop</Text>
            <Text style={styles.detailValue}>{worklog.listGrowthStageName.join(', ')}</Text>
          </View>
          <View style={styles.detailItem}>
            <CustomIcon name="cog" size={20} color="#064944" type="MaterialCommunityIcons" />
            <Text style={styles.detailLabel}>Process</Text>
            <Text style={styles.detailValue}>{worklog.processName}</Text>
          </View>

          <View style={styles.detailItem}>
            <CustomIcon name="calendar" size={20} color="#064944" type="MaterialCommunityIcons" />
            <Text style={styles.detailLabel}>Plan</Text>
            <Text style={styles.detailValue}>{worklog.planName}</Text>
          </View>
          <View style={styles.detailItem}>
            <CustomIcon name="tag" size={20} color="#064944" type="MaterialCommunityIcons" />
            <Text style={styles.detailLabel}>Type</Text>
            <Text style={styles.detailValue}>{worklog.masterTypeName}</Text>
          </View>

          <View style={styles.detailItem}>
            <CustomIcon name="leaf" size={20} color="#064944" type="MaterialCommunityIcons" />
            <Text style={styles.detailLabel}>Growth Stage</Text>
            <Text style={styles.detailValue}>{worklog.listGrowthStageName.join(', ')}</Text>
          </View>
          <View style={styles.detailItem}>
            <CustomIcon name="map-marker" size={20} color="#064944" type="MaterialCommunityIcons" />
            <Text style={styles.detailLabel}>Lot</Text>
            <Text style={styles.detailValue}>{worklog.planTargetModels[0]?.landPlotName}</Text>
          </View>
        </View>
      </View>

      {/* Timeline Notes */}
      <View style={styles.section}>
        <View style={styles.timelineHeader}>
          <Text style={styles.sectionTitle}>Timeline Notes</Text>
          <TouchableOpacity style={styles.addNoteButton} onPress={handleAddNote}>
            <CustomIcon name="plus" size={20} color="#fff" type="MaterialCommunityIcons" />
            <Text style={styles.addNoteText}>Add Note</Text>
          </TouchableOpacity>
        </View>
        {worklog.listNoteOfWorkLog.length > 0 ? (
          worklog.listNoteOfWorkLog.map((note, index) => (
            <View key={index} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View style={styles.timelineDot} />
                {index < worklog.listNoteOfWorkLog.length - 1 && (
                  <View style={styles.timelineLine} />
                )}
              </View>
              <View style={styles.timelineContent}>
                <View style={styles.timelineHeader}>
                  <View style={styles.timelineDateContainer}>
                    <Image source={{ uri: note.avatarURL }} style={styles.avatarSmall} />
                    <View style={{ flexDirection: 'column' }}>
                      <View style={{ flexDirection: 'row', gap: 10 }}>
                        <Text style={styles.timelineAuthor}>{note.fullName}</Text>
                        <Text style={styles.createText}>created this note</Text>
                      </View>
                      <Text style={styles.timelineDate}>
                        {new Date(worklog.date).toLocaleDateString('vi-VN')}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.timelineNote}>
                  {note.issue && (
                    <View>
                      <Text style={styles.timelineText}>Issues:</Text>
                      <Text style={styles.issueText}>{note.issue}</Text>
                    </View>
                  )}
                  {note.notes && (
                    <View>
                      <Text style={styles.timelineText}>Notes:</Text>
                      <Text style={styles.issueText}>{note.notes}</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <CustomIcon name="note" size={40} color="#ccc" type="MaterialCommunityIcons" />
            <Text style={styles.emptyText}>No notes recorded yet</Text>
          </View>
        )}
      </View>

      {/* Feedback Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Feedback</Text>
        {worklog.listTaskFeedback.length > 0 ? (
          <Text style={styles.feedbackText}>This worklog has feedback.</Text>
        ) : (
          <Text style={styles.feedbackText}>No feedback available.</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFCEE', // Nền sáng nhẹ, hiện đại
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
    color: '#064944',
    textAlign: 'center',
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  worklogCode: {
    fontSize: 14,
    color: '#064944',
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
    color: '#064944',
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
    color: '#064944',
    fontWeight: '500',
  },
  section: {
    marginHorizontal: 20,
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#064944',
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
    color: '#064944',
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
    color: '#064944',
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
    maxWidth: 60, // Giới hạn chiều rộng để tên không bị tràn
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
    color: '#064944',
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
    backgroundColor: '#064944',
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
    backgroundColor: '#064944',
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
    color: '#064944',
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
    color: '#064944',
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
  }
});

export default WorklogDetailScreen;