import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import {
  RootStackNavigationProp,
  WorklogDetailScreenProps,
} from "@/constants/Types";
import { useNavigation } from "@react-navigation/native";
import { ROUTE_NAMES } from "@/constants/RouteNames";
import {
  CancelWorklogRequest,
  ResourceItem,
  StatusType,
  UpdateStatusWorklogRequest,
  WorklogDetail,
  WorklogNoteFormData,
} from "@/types/worklog";
import Toast from "react-native-toast-message";
import theme from "@/theme";
import { styles } from "./WorklogDetailScreen.styles";
import {
  BackButton,
  CustomIcon,
  NoteDetailModal,
  StatusBadge,
  TextCustom,
} from "@/components";
import { worklogService } from "@/services";
import { useAuthStore } from "@/store";
import FeedbackSection from "../FeedbackSection/FeedbackSection";
import { UserRole } from "@/constants";

const WorklogDetailScreen: React.FC<WorklogDetailScreenProps> = ({ route }) => {
  const { worklogId } = route.params;
  const { userId, roleId } = useAuthStore();
  const navigation = useNavigation<RootStackNavigationProp>();
  const [worklog, setWorklog] = useState<WorklogDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedResources, setSelectedResources] = useState<ResourceItem[]>(
    []
  );
  const currentUser = 2;

  const fetchWorklogDetail = async () => {
    try {
      const res = await worklogService.getWorklogDetail(Number(worklogId));
      setWorklog(res);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching mock worklog detail:", error);
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchWorklogDetail();
  }, [worklogId]);

  const isUserRejected = () => {
    const isRejectedInEmployee = worklog?.listEmployee.some(
      (employee) => {
        const isRejected =
          employee.userId === Number(userId) &&
          employee.statusOfUserWorkLog?.toLowerCase() === "rejected";
        return isRejected;
      }
    ) || false;
    const isRejectedInReporter = worklog?.reporter.some(
      (reporter) => {
        const isRejected =
          reporter.userId === Number(userId) &&
          reporter.statusOfUserWorkLog?.toLowerCase() === "rejected";
        return isRejected;
      }
    ) || false;
    console.log("Is user rejected:", isRejectedInEmployee || isRejectedInReporter);
    return isRejectedInEmployee || isRejectedInReporter;
  };

  const isUserReporter = () => {
    return worklog?.reporter.some(
      (reporter) => reporter.userId === Number(userId)
    ) || false;
  };

  const canRedoWorklog = () => {
    return worklog?.status.toLowerCase() !== "rejected" && isUserRejected();
  };

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

  const handleRedoWorklog = async () => {
    Alert.alert(
      "Confirm Redo",
      "Are you sure you want to redo this worklog?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              console.log("Redoing worklog:", worklogId);
              const payload = {
                workLogId: Number(worklogId),
                userId: Number(userId),
              };
              const res = await worklogService.cancelWorklog(payload);
              if (res.statusCode === 200) {
                Toast.show({
                  type: "success",
                  text1: "Worklog redo requested successfully",
                });
                fetchWorklogDetail();
              } else {
                Toast.show({
                  type: "error",
                  text1: "Redo worklog failed",
                });
              }
            } catch (error) {
              console.error("Error redoing worklog:", error);
              Alert.alert(
                "Error",
                "Failed to redo worklog. Please try again."
              );
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleCancelWorklog = () => {
    Alert.alert(
      "Confirm Cancellation",
      "Are you sure you want to cancel this worklog?",
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: async () => {
            try {
              console.log("Cancelling worklog:", worklogId);
              const payload: CancelWorklogRequest = {
                workLogId: Number(worklogId),
                userId: Number(userId)
              }
              const res = await worklogService.cancelWorklog(payload);
              if (res.statusCode === 200) {
                Toast.show({
                  type: "success",
                  text1: "Cancel worklog successfully",
                });
                fetchWorklogDetail();
              } else {
                Toast.show({
                  type: "error",
                  text1: "Cancel worklog failed",
                });
              }

              setWorklog((prev) =>
                prev ? { ...prev, status: "Cancelled" } : null
              );
            } catch (error) {
              console.error("Error cancelling worklog:", error);
              Alert.alert(
                "Error",
                "Failed to cancel worklog. Please try again."
              );
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleAddNote = () => {
    navigation.navigate(ROUTE_NAMES.WORKLOG.ADD_NOTE_WORKLOG, {
      worklogId: worklog.workLogId,
    });
  };

  const processResources = (resources?: string[]) => {
    if (!resources) return { images: [], videos: [] };
    const images = resources.filter((url) =>
      /\.(jpg|jpeg|png|gif)$/i.test(url)
    );
    const videos = resources.filter((url) => /\.(mp4|mov|avi)$/i.test(url));
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
      type: "success",
      text1: "Note Deleted",
      text2: "The note has been successfully deleted.",
    });
  };

  const handleMarkAsComplete = async () => {
    Alert.alert(
      "Confirm Completion",
      "Are you sure you want to mark this worklog as completed?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              console.log("Marking worklog as complete:", worklogId);
              const payload: UpdateStatusWorklogRequest = {
                workLogId: Number(worklogId),
                status: "Reviewing",
              };
              const res = await worklogService.updateStatusWorklog(payload);
              if (res.statusCode === 200) {
                Toast.show({
                  type: "success",
                  text1: "Worklog marked as completed successfully",
                });
                fetchWorklogDetail();
              } else {
                Toast.show({
                  type: "error",
                  text1: "Failed to mark worklog as completed",
                });
              }
            } catch (error) {
              console.error("Error marking worklog as complete:", error);
              Alert.alert(
                "Error",
                "Failed to mark worklog as completed. Please try again."
              );
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={{ marginTop: -100 }}>
          <BackButton
            targetScreen={ROUTE_NAMES.MAIN.DRAWER}
            targetParams={{
              screen: ROUTE_NAMES.MAIN.MAIN_TABS,
              params: { screen: "Worklog" },
            }}
            iconColor="white"
          />
        </View>

        <View style={styles.headerContent}>
          <TextCustom style={styles.worklogName}>
            {worklog.workLogName}
          </TextCustom>
          <TextCustom style={styles.worklogCode}>
            Code: {worklog.workLogCode}
          </TextCustom>
          <StatusBadge status={worklog.status as StatusType} />
        </View>
        {![UserRole.Owner.toString(), UserRole.Manager.toString()].includes(roleId!) && (
          <>
            {!isUserRejected() && worklog.status === "Not Started" ? (
              <TouchableOpacity onPress={handleCancelWorklog} style={styles.delBtn}>
                <CustomIcon
                  name="cancel"
                  size={24}
                  color="red"
                  type="MaterialCommunityIcons"
                />
              </TouchableOpacity>
            ) : canRedoWorklog() ? (
              <TouchableOpacity onPress={handleRedoWorklog} style={styles.delBtn}>
                <CustomIcon
                  name="restore"
                  size={24}
                  color="green"
                  type="MaterialCommunityIcons"
                />
              </TouchableOpacity>
            ) : null}
          </>
        )}
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
            {new Date(worklog.date).toLocaleDateString("vi-VN")}
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

      {isUserReporter() && worklog.status === "In Progress" && ![UserRole.Owner.toString(), UserRole.Manager.toString()].includes(roleId!) && (
        <TouchableOpacity
          style={[
            styles.markAsCompleted,
          ]}
          onPress={() => handleMarkAsComplete()}
          disabled={worklog.status.toLowerCase() === "reviewing"}
        >
          <CustomIcon
            name="checkmark"
            type="Ionicons"
            size={20}
            color={
              worklog.status.toLowerCase() === "reviewing"
                ? theme.colors.gray
                : theme.colors.secondary
            }
          />
          <TextCustom
            style={[
              styles.markAsCompletedText,
              worklog.status.toLowerCase() === "reviewing" && { color: theme.colors.gray },
            ]}
          >
            Mark As Completed
          </TextCustom>
        </TouchableOpacity>
      )}

      {/* Assign Information */}
      <View style={styles.section}>
        <TextCustom style={styles.sectionTitle}>Assign Information</TextCustom>
        <View style={styles.assignCard}>
          <View style={styles.userCard}>
            <Image
              source={{ uri: worklog.assignorAvatarURL }}
              style={styles.avatar}
            />
            <View style={styles.userInfo}>
              <View style={{ flexDirection: "row", gap: 7 }}>
                <TextCustom style={styles.userName}>
                  {worklog.assignorName}
                </TextCustom>
                <TextCustom style={styles.userRole}>
                  created this plan
                </TextCustom>
              </View>
              <TextCustom style={styles.userDate}>
                {new Date(worklog.date).toLocaleDateString("vi-VN")}
              </TextCustom>
            </View>
          </View>

          <View style={styles.dividerHorizontal} />

          {/* Assigned To */}
          <View style={styles.userList}>
            <TextCustom style={styles.listTitle}>Assigned To:</TextCustom>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {worklog.listEmployee.map((employee) => {
                const isCurrentUser = employee.userId === Number(userId);
                return (
                  <View
                    key={employee.userId}
                    style={[
                      styles.userItemHorizontal,
                      isCurrentUser && styles.highlightedUser,
                    ]}
                  >
                    <Image
                      source={{ uri: employee.avatarURL }}
                      style={[
                        styles.avatarSmall,
                        isCurrentUser && styles.avatarHighlighted,
                      ]}
                    />
                    <TextCustom
                      style={[
                        styles.userNameSmallHorizontal,
                        isCurrentUser && styles.userNameHighlighted,
                      ]}
                    >
                      {employee.fullName}
                    </TextCustom>
                  </View>
                )
              })}
            </ScrollView>
          </View>

          {/* Reporter */}
          <View style={styles.userList}>
            <TextCustom style={styles.listTitle}>Reporter:</TextCustom>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {worklog.reporter[0] && (
                <View
                  style={[
                    styles.userItemHorizontal,
                    worklog.reporter[0].userId === Number(userId) && styles.highlightedUser,
                  ]}
                >
                  <Image
                    source={{ uri: worklog.reporter[0].avatarURL }}
                    style={[
                      styles.avatarSmall,
                      worklog.reporter[0].userId === Number(userId) && styles.avatarHighlighted,
                    ]}
                  />
                  <TextCustom
                    style={[
                      styles.userNameSmallHorizontal,
                      worklog.reporter[0].userId === Number(userId) && styles.userNameHighlighted,
                    ]}
                  >
                    {worklog.reporter[0].fullName}
                  </TextCustom>
                </View>
              )}
            </ScrollView>
          </View>


          {/* Replacement */}
          <View style={styles.userList}>
            <TextCustom style={styles.listTitle}>Replacement:</TextCustom>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {worklog.replacementEmployee.map((replacement, index) => (
                <View key={index} style={styles.userItemHorizontal}>
                  <Image
                    source={{ uri: replacement.avatar }}
                    style={styles.avatarSmall}
                  />
                  <TextCustom style={styles.userNameSmallHorizontal}>
                    {replacement.replaceUserFullName}
                  </TextCustom>
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
            <CustomIcon
              name="sprout"
              size={20}
              color="#064944"
              type="MaterialCommunityIcons"
            />
            <TextCustom style={styles.detailLabel}>Crop</TextCustom>
            <TextCustom style={styles.detailValue}>
              {worklog.listGrowthStageName?.length
                ? worklog.listGrowthStageName.join(", ")
                : "N/A"}
            </TextCustom>

          </View>
          <View style={styles.detailItem}>
            <CustomIcon
              name="cog"
              size={20}
              color="#064944"
              type="MaterialCommunityIcons"
            />
            <TextCustom style={styles.detailLabel}>Process</TextCustom>
            <TextCustom style={styles.detailValue}>
              {worklog.processName}
            </TextCustom>
          </View>

          <View style={styles.detailItem}>
            <CustomIcon
              name="calendar"
              size={20}
              color="#064944"
              type="MaterialCommunityIcons"
            />
            <TextCustom style={styles.detailLabel}>Plan</TextCustom>
            <TextCustom style={styles.detailValue}>
              {worklog.planName}
            </TextCustom>
          </View>
          <View style={styles.detailItem}>
            <CustomIcon
              name="tag"
              size={20}
              color="#064944"
              type="MaterialCommunityIcons"
            />
            <TextCustom style={styles.detailLabel}>Type</TextCustom>
            <TextCustom style={styles.detailValue}>
              {worklog.masterTypeName}
            </TextCustom>
          </View>

          <View style={styles.detailItem}>
            <CustomIcon
              name="leaf"
              size={20}
              color="#064944"
              type="MaterialCommunityIcons"
            />
            <TextCustom style={styles.detailLabel}>Growth Stage</TextCustom>
            <TextCustom style={styles.detailValue}>
              {worklog.listGrowthStageName.join(", ")}
            </TextCustom>
          </View>
          <View style={styles.detailItem}>
            <CustomIcon
              name="map-marker"
              size={20}
              color="#064944"
              type="MaterialCommunityIcons"
            />
            <TextCustom style={styles.detailLabel}>Lot</TextCustom>
            <TextCustom style={styles.detailValue}>
              {worklog.planTargetModels[0]?.landPlotName}
            </TextCustom>
          </View>
          <View style={styles.detailItem}>
            <CustomIcon
              name="basket"
              size={20}
              color="#064944"
              type="MaterialCommunityIcons"
            />
            <TextCustom style={styles.detailLabel}>Harvest</TextCustom>
            <TextCustom style={styles.detailValue}>
              {worklog.isHarvest ? "Yes" : "No"}
            </TextCustom>
          </View>
        </View>
      </View>

      {/* Timeline Notes */}
      <View style={styles.section}>
        <View style={styles.timelineHeader}>
          <TextCustom style={styles.sectionTitle}>Timeline Notes</TextCustom>
          {
            ![UserRole.Owner.toString(), UserRole.Manager.toString()].includes(roleId!) && (
              <TouchableOpacity
                style={styles.addNoteButton}
                onPress={handleAddNote}
              >
                <CustomIcon
                  name="plus"
                  size={20}
                  color="#fff"
                  type="MaterialCommunityIcons"
                />
                <TextCustom style={styles.addNoteText}>Add Note</TextCustom>
              </TouchableOpacity>
            )
          }

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
                    <Image
                      source={{ uri: note.avatarURL }}
                      style={styles.avatarSmall}
                    />
                    <View style={{ flexDirection: "column" }}>
                      <View style={{ flexDirection: "row", gap: 10 }}>
                        <TextCustom style={styles.timelineAuthor}>
                          {note.fullName}
                        </TextCustom>
                        <TextCustom style={styles.createText}>
                          created this note
                        </TextCustom>
                      </View>
                      <TextCustom style={styles.timelineDate}>
                        {new Date(worklog.date).toLocaleDateString("vi-VN")}
                      </TextCustom>
                    </View>
                  </View>
                </View>
                <View style={styles.timelineNote}>
                  {note.issue && (
                    <View>
                      <TextCustom style={styles.timelineText}>
                        Issues:
                      </TextCustom>
                      <TextCustom style={styles.issueText}>
                        {note.issue}
                      </TextCustom>
                    </View>
                  )}
                  {note.notes && (
                    <View>
                      <TextCustom style={styles.timelineText}>
                        Notes:
                      </TextCustom>
                      <TextCustom style={styles.issueText}>
                        {note.notes}
                      </TextCustom>
                    </View>
                  )}
                </View>
                <View style={styles.actionBtnContainer}>
                  {note.listResources.length > 0 && (
                    <TouchableOpacity
                      style={styles.detailButton}
                      onPress={() => showDetailModal(note.listResources)}
                    >
                      <TextCustom style={styles.detailButtonText}>
                        Detail
                      </TextCustom>
                    </TouchableOpacity>
                  )}
                  {note.userId === currentUser && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate(
                            ROUTE_NAMES.WORKLOG.ADD_NOTE_WORKLOG,
                            {
                              worklogId: worklog.workLogId,
                              historyId: note.userWorklogId,
                              initialData: {
                                note: note.notes,
                                issue: note.issue,
                                resources: note.listResources,
                              },
                            }
                          )
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
            <CustomIcon
              name="note"
              size={40}
              color="#ccc"
              type="MaterialCommunityIcons"
            />
            <TextCustom style={styles.emptyText}>
              No notes recorded yet
            </TextCustom>
          </View>
        )}
      </View>

      <NoteDetailModal
        visible={modalVisible}
        resources={selectedResources}
        onClose={closeDetailModal}
      />

      {/* Feedback Section */}
      <View style={styles.section}>
        <TextCustom style={styles.sectionTitle}>Feedback</TextCustom>
        <FeedbackSection feedbacks={worklog?.listTaskFeedback || []} />
      </View>
    </ScrollView>
  );
};

export default WorklogDetailScreen;
