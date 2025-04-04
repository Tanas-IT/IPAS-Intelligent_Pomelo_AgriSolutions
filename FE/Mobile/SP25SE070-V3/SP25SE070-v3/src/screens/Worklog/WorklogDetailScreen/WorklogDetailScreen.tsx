import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { RootStackNavigationProp, WorklogDetailScreenProps } from '@/navigation/Types';
import { useNavigation } from '@react-navigation/native';
import CustomIcon from 'components/CustomIcon';
import BackButton from 'components/BackButton';
import { ROUTE_NAMES } from '@/navigation/RouteNames';
import { ResourceItem, WorklogDetail, WorklogNoteFormData } from '@/types/worklog';
import NoteDetailModal2 from 'components/NoteDetailModal2';
import Toast from 'react-native-toast-message';
import theme from '@/theme';
import { styles } from './WorklogDetailScreen.styles';
import TextCustom from 'components/TextCustom';

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
      userWorklogId: 1,
      notes: "ooooo",
      fullName: "Jane Smith",
      avatarURL: "https://res.cloudinary.com/dgshx4n2c/image/upload/v1741755465/ppgzlr8a9fdf5kxbo3uv.png",
      issue: "ppppp",
      userId: 2,
      listResources: [
        {
          resourceID: 6,
          resourceCode: "RES-006",
          resourceURL: "https://res.cloudinary.com/dgshx4n2c/image/upload/v1739010644/lfcr5rsg6rnm1y2a7euc.jpg",
        },
      ],
    },
    {
      userWorklogId: 2,
      notes: "kkkkkk",
      fullName: "The Tam",
      avatarURL: "https://res.cloudinary.com/dgshx4n2c/image/upload/v1741755512/gkk4m8onahfl8dacc4qf.png",
      issue: "llll",
      userId: 4,
      listResources: [
        {
          resourceID: 7,
          resourceCode: "RES-007",
          resourceURL: "https://res.cloudinary.com/dgshx4n2c/image/upload/v1739010644/lfcr5rsg6rnm1y2a7euc.jpg",
        },
      ],
    },
    {
      userWorklogId: 3,
      notes: "iiiiiiiii",
      fullName: "Ai Giao",
      avatarURL: "https://res.cloudinary.com/dgshx4n2c/image/upload/v1741755628/hikdhs0nnj9l6zkqbjje.jpg",
      issue: "mmmm",
      userId: 6,
      listResources: [
        {
          resourceID: 8,
          resourceCode: "RES-008",
          resourceURL: "https://res.cloudinary.com/dgshx4n2c/image/upload/v1739010644/lfcr5rsg6rnm1y2a7euc.jpg",
        },
      ],
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



const WorklogDetailScreen: React.FC<WorklogDetailScreenProps> = ({ route }) => {
  const { worklogId } = route.params;
  const navigation = useNavigation<RootStackNavigationProp>();
  const [worklog, setWorklog] = useState<WorklogDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedResources, setSelectedResources] = useState<ResourceItem[]>([]);
  const currentUser = 2;
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
    Alert.alert(
      'Confirm Cancellation',
      'Are you sure you want to cancel this worklog?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              console.log('Cancelling worklog:', worklogId);

              setWorklog((prev) =>
                prev ? { ...prev, status: 'Cancelled' } : null
              );
            } catch (error) {
              console.error('Error cancelling worklog:', error);
              Alert.alert('Error', 'Failed to cancel worklog. Please try again.');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleAddNote = () => {
    navigation.navigate(ROUTE_NAMES.WORKLOG.ADD_NOTE_WORKLOG, { worklogId: worklog.workLogId });
  };

  const processResources = (resources?: string[]) => {
    if (!resources) return { images: [], videos: [] };
    const images = resources.filter((url) =>
      /\.(jpg|jpeg|png|gif)$/i.test(url)
    );
    const videos = resources.filter((url) =>
      /\.(mp4|mov|avi)$/i.test(url)
    );
    return { images, videos };
  };

  const showDetailModal = (resources: ResourceItem[]) => {
    setSelectedResources(resources);
    setModalVisible(true);
  };

  const closeDetailModal = () => {
    setModalVisible(false);
    setSelectedResources([]);
  };

  const handleDelete = (historyId: number) => {
          Toast.show({
              type: 'success',
              text1: 'Note Deleted',
              text2: 'The note has been successfully deleted.',
          });
      };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={{ marginTop: -100 }}>
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
          <TextCustom style={styles.worklogName}>{worklog.workLogName}</TextCustom>
          {/* <View style={styles.headerInfo}> */}
          <TextCustom style={styles.worklogCode}>Code: {worklog.workLogCode}</TextCustom>
          <View style={styles.statusTag}>
            <TextCustom style={styles.statusText}>{worklog.status}</TextCustom>
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

      <View style={styles.dateTimeFrame}>
        <View style={styles.dateTimeItem}>
          <CustomIcon
            name="calendar"
            size={20}
            color="#064944"
            type="MaterialCommunityIcons"
          />
          <TextCustom style={styles.dateTimeText}>
            {new Date(worklog.date).toLocaleDateString('vi-VN')}
          </TextCustom>
        </View>
        <View style={styles.divider} />
        <View style={styles.dateTimeItem}>
          <CustomIcon
            name="clock-outline"
            size={20}
            color="#064944"
            type="MaterialCommunityIcons"
          />
          <TextCustom style={styles.dateTimeText}>
            {worklog.actualStartTime} - {worklog.actualEndTime}
          </TextCustom>
        </View>
      </View>
      {/* neu la reporter thi mark */}
      <TouchableOpacity style={styles.markAsCompleted}>
        <CustomIcon
        name='checkmark'
        type='Ionicons'
        size={20}
        color={theme.colors.secondary}/>
        <TextCustom style={styles.markAsCompletedText}>Mark As Completed</TextCustom>
      </TouchableOpacity>

      {/* Assign Information */}
      <View style={styles.section}>
        <TextCustom style={styles.sectionTitle}>Assign Information</TextCustom>
        <View style={styles.assignCard}>
          <View style={styles.userCard}>
            <Image
              source={{ uri: worklog.reporter[0]?.avatarURL }}
              style={styles.avatar}
            />
            <View style={styles.userInfo}>
              <View style={{ flexDirection: 'row', gap: 7 }}>
                <TextCustom style={styles.userName}>{worklog.reporter[0]?.fullName}</TextCustom>
                <TextCustom style={styles.userRole}>created this plan</TextCustom>
              </View>
              <TextCustom style={styles.userDate}>
                {new Date(worklog.date).toLocaleDateString('vi-VN')}
              </TextCustom>
            </View>
          </View>

          <View style={styles.dividerHorizontal} />

          {/* Assigned To */}
          <View style={styles.userList}>
            <TextCustom style={styles.listTitle}>Assigned To:</TextCustom>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {worklog.listEmployee.map((employee) => (
                <View key={employee.userId} style={styles.userItemHorizontal}>
                  <Image source={{ uri: employee.avatarURL }} style={styles.avatarSmall} />
                  <TextCustom style={styles.userNameSmallHorizontal}>{employee.fullName}</TextCustom>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Reporter */}
          <View style={styles.userList}>
            <TextCustom style={styles.listTitle}>Reporter:</TextCustom>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.userItemHorizontal}>
                <Image
                  source={{ uri: worklog.reporter[0]?.avatarURL }}
                  style={styles.avatarSmall}
                />
                <TextCustom style={styles.userNameSmallHorizontal}>{worklog.reporter[0]?.fullName}</TextCustom>
              </View>
            </ScrollView>
          </View>

          {/* Replacement */}
          <View style={styles.userList}>
            <TextCustom style={styles.listTitle}>Replacement:</TextCustom>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {worklog.replacementEmployee.map((replacement, index) => (
                <View key={index} style={styles.userItemHorizontal}>
                  <Image source={{ uri: replacement.avatar }} style={styles.avatarSmall} />
                  <TextCustom style={styles.userNameSmallHorizontal}>{replacement.fullName}</TextCustom>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>

      {/* Detail */}
      <View style={styles.section}>
        <TextCustom style={styles.sectionTitle}>Detail</TextCustom>
        <View style={styles.detailGrid}>
          <View style={styles.detailItem}>
            <CustomIcon name="sprout" size={20} color="#064944" type="MaterialCommunityIcons" />
            <TextCustom style={styles.detailLabel}>Crop</TextCustom>
            <TextCustom style={styles.detailValue}>{worklog.listGrowthStageName.join(', ')}</TextCustom>
          </View>
          <View style={styles.detailItem}>
            <CustomIcon name="cog" size={20} color="#064944" type="MaterialCommunityIcons" />
            <TextCustom style={styles.detailLabel}>Process</TextCustom>
            <TextCustom style={styles.detailValue}>{worklog.processName}</TextCustom>
          </View>

          <View style={styles.detailItem}>
            <CustomIcon name="calendar" size={20} color="#064944" type="MaterialCommunityIcons" />
            <TextCustom style={styles.detailLabel}>Plan</TextCustom>
            <TextCustom style={styles.detailValue}>{worklog.planName}</TextCustom>
          </View>
          <View style={styles.detailItem}>
            <CustomIcon name="tag" size={20} color="#064944" type="MaterialCommunityIcons" />
            <TextCustom style={styles.detailLabel}>Type</TextCustom>
            <TextCustom style={styles.detailValue}>{worklog.masterTypeName}</TextCustom>
          </View>

          <View style={styles.detailItem}>
            <CustomIcon name="leaf" size={20} color="#064944" type="MaterialCommunityIcons" />
            <TextCustom style={styles.detailLabel}>Growth Stage</TextCustom>
            <TextCustom style={styles.detailValue}>{worklog.listGrowthStageName.join(', ')}</TextCustom>
          </View>
          <View style={styles.detailItem}>
            <CustomIcon name="map-marker" size={20} color="#064944" type="MaterialCommunityIcons" />
            <TextCustom style={styles.detailLabel}>Lot</TextCustom>
            <TextCustom style={styles.detailValue}>{worklog.planTargetModels[0]?.landPlotName}</TextCustom>
          </View>
        </View>
      </View>

      {/* Timeline Notes */}
      <View style={styles.section}>
        <View style={styles.timelineHeader}>
          <TextCustom style={styles.sectionTitle}>Timeline Notes</TextCustom>
          <TouchableOpacity style={styles.addNoteButton} onPress={handleAddNote}>
            <CustomIcon name="plus" size={20} color="#fff" type="MaterialCommunityIcons" />
            <TextCustom style={styles.addNoteText}>Add Note</TextCustom>
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
                        <TextCustom style={styles.timelineAuthor}>{note.fullName}</TextCustom>
                        <TextCustom style={styles.createText}>created this note</TextCustom>
                      </View>
                      <TextCustom style={styles.timelineDate}>
                        {new Date(worklog.date).toLocaleDateString('vi-VN')}
                      </TextCustom>
                    </View>
                  </View>
                </View>
                <View style={styles.timelineNote}>
                  {note.issue && (
                    <View>
                      <TextCustom style={styles.timelineText}>Issues:</TextCustom>
                      <TextCustom style={styles.issueText}>{note.issue}</TextCustom>
                    </View>
                  )}
                  {note.notes && (
                    <View>
                      <TextCustom style={styles.timelineText}>Notes:</TextCustom>
                      <TextCustom style={styles.issueText}>{note.notes}</TextCustom>
                    </View>
                  )}
                </View>
                <View style={styles.actionBtnContainer}>
                  {note.listResources.length > 0 && (
                    <TouchableOpacity
                      style={styles.detailButton}
                      onPress={() => showDetailModal(note.listResources)}
                    >
                      <TextCustom style={styles.detailButtonText}>Detail</TextCustom>
                    </TouchableOpacity>
                  )}
                  {note.userId === currentUser && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate(ROUTE_NAMES.WORKLOG.ADD_NOTE_WORKLOG, {
                            worklogId: worklog.workLogId,
                            historyId: note.userWorklogId,
                            initialData: {
                              note: note.notes,
                              issue: note.issue,
                              resources: note.listResources,
                            },
                          })
                        }
                      >
                        <CustomIcon
                          name="pencil"
                          size={20}
                          color="#064944"
                          type="MaterialCommunityIcons"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleDelete(note.userWorklogId)}
                        style={{ marginLeft: 10 }}
                      >
                        <CustomIcon
                          name="delete"
                          size={20}
                          color="#F44336"
                          type="MaterialCommunityIcons"
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <CustomIcon name="note" size={40} color="#ccc" type="MaterialCommunityIcons" />
            <TextCustom style={styles.emptyText}>No notes recorded yet</TextCustom>
          </View>
        )}
      </View>

      <NoteDetailModal2
        visible={modalVisible}
        resources={selectedResources}
        onClose={closeDetailModal}
      />

      {/* Feedback Section */}
      <View style={styles.section}>
        <TextCustom style={styles.sectionTitle}>Feedback</TextCustom>
        {worklog.listTaskFeedback.length > 0 ? (
          <TextCustom style={styles.feedbackText}>This worklog has feedback.</TextCustom>
        ) : (
          <TextCustom style={styles.feedbackText}>No feedback available.</TextCustom>
        )}
      </View>
    </ScrollView>
  );
};



export default WorklogDetailScreen;