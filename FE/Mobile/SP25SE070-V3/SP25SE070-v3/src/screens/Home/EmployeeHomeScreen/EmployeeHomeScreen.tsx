import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import theme from "@/theme";

import { GetWorklogByStatus } from "@/types";
import { useNavigation } from "@react-navigation/native";
import { RootStackNavigationProp } from "@/constants/Types";
import { ROUTE_NAMES } from "@/constants/RouteNames";
import { StatBox } from "../components/StatBox";
import { styles } from "./EmployeeHomeScreen.styles";
import { AvatarList } from "../components/AvatarList";
import { StatusBadge, TextCustom } from "@/components";
import { formatTime } from "@/utils";

const EmployeeHomeScreen = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  // fake data
  const upcomingTasks: GetWorklogByStatus[] = [
    {
      worklogId: 3,
      worklogName: "API Integration",
      date: "2025-03-28",
      time: "07:00:00 - 08:00:00",
      status: "done" as const,
      avatarEmployees: [
        "https://res.cloudinary.com/dgshx4n2c/image/upload/v1741755628/hikdhs0nnj9l6zkqbjje.jpg",
        "https://res.cloudinary.com/dgshx4n2c/image/upload/v1741755628/hikdhs0nnj9l6zkqbjje.jpg",
      ],
    },
    {
      worklogId: 4,
      worklogName: "abccccc",
      date: "2025-03-28",
      time: "07:00:00 - 08:00:00",
      status: "done" as const,
      avatarEmployees: [
        "https://res.cloudinary.com/dgshx4n2c/image/upload/v1741755628/hikdhs0nnj9l6zkqbjje.jpg",
        "https://res.cloudinary.com/dgshx4n2c/image/upload/v1741755628/hikdhs0nnj9l6zkqbjje.jpg",
      ],
    },
  ];

  const ongoingTasks: GetWorklogByStatus[] = [
    {
      worklogId: 5,
      worklogName: "API Integration",
      date: "2025-03-28",
      time: "07:00:00 - 08:00:00",
      status: "done" as const,
      avatarEmployees: [
        "https://res.cloudinary.com/dgshx4n2c/image/upload/v1741755628/hikdhs0nnj9l6zkqbjje.jpg",
        "https://res.cloudinary.com/dgshx4n2c/image/upload/v1741755628/hikdhs0nnj9l6zkqbjje.jpg",
      ],
    },
    {
      worklogId: 6,
      worklogName: "abccccc",
      date: "2025-03-28",
      time: "07:00:00 - 08:00:00",
      status: "done" as const,
      avatarEmployees: [
        "https://res.cloudinary.com/dgshx4n2c/image/upload/v1741755628/hikdhs0nnj9l6zkqbjje.jpg",
        "https://res.cloudinary.com/dgshx4n2c/image/upload/v1741755628/hikdhs0nnj9l6zkqbjje.jpg",
      ],
    },
  ];

  const taskStats = {
    completed: 15,
    pending: 4,
    total: 19,
  };

  const completedTasksHistory: GetWorklogByStatus[] = [
    {
      worklogId: 1,
      worklogName: "API Integration",
      date: "2025-03-28",
      time: "07:00:00 - 08:00:00",
      status: "done" as const,
      avatarEmployees: [
        "https://res.cloudinary.com/dgshx4n2c/image/upload/v1741755628/hikdhs0nnj9l6zkqbjje.jpg",
        "https://res.cloudinary.com/dgshx4n2c/image/upload/v1741755628/hikdhs0nnj9l6zkqbjje.jpg",
      ],
    },
    {
      worklogId: 2,
      worklogName: "abccccc",
      date: "2025-03-28",
      time: "07:00:00 - 08:00:00",
      status: "done" as const,
      avatarEmployees: [
        "https://res.cloudinary.com/dgshx4n2c/image/upload/v1741755628/hikdhs0nnj9l6zkqbjje.jpg",
        "https://res.cloudinary.com/dgshx4n2c/image/upload/v1741755628/hikdhs0nnj9l6zkqbjje.jpg",
      ],
    },
  ];

  const statsData = [
    {
      icon: "checkmark-circle",
      color: "#28a745",
      value: taskStats.completed,
      label: "Completed",
    },
    {
      icon: "hourglass",
      color: "#ffc107",
      value: taskStats.pending,
      label: "Pending",
    },
    { icon: "list", color: "#17a2b8", value: taskStats.total, label: "Total" },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header */}
      <LinearGradient
        colors={["#d3f0e5", "#BCD379"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerContainer}>
          <TextCustom style={styles.headerUserText}>Laggg</TextCustom>
          <TextCustom style={styles.headerText}>Welcome Back!</TextCustom>
        </View>
        <TextCustom style={styles.subHeaderText}>
          You have 2 tasks todayy
        </TextCustom>
      </LinearGradient>

      {/* Task Statistics */}
      <View style={styles.section}>
        <TextCustom style={styles.sectionTitle}>Task Statistics</TextCustom>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsContainer}
        >
          {statsData.map((stat, index) => (
            <StatBox
              key={index}
              icon={stat.icon}
              color={stat.color}
              value={stat.value}
              label={stat.label}
            />
          ))}
        </ScrollView>
      </View>

      {/* Ongoing */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ongoing Tasks</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 16 }}
        >
          {ongoingTasks.map((task) => (
            <TouchableOpacity
              key={task.worklogId}
              style={[
                styles.card,
                theme.shadow.default,
                { backgroundColor: theme.colors.secondary },
              ]}
              onPress={() =>
                navigation.navigate(ROUTE_NAMES.WORKLOG.WORKLOG_DETAIL, {
                  worklogId: task.worklogId.toString(),
                })
              }
            >
              <TextCustom numberOfLines={1} style={styles.cardTitle}>
                {task.worklogName}
              </TextCustom>
              <View
                style={{ flexDirection: "row", gap: 20, alignItems: "center" }}
              >
                <AvatarList avatars={task.avatarEmployees} />
                <TextCustom style={styles.time}>
                  {formatTime(task.time)}
                </TextCustom>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Upcoming */}
      <View style={styles.section}>
        <TextCustom style={styles.sectionTitle}>
          Upcoming Tasks ({upcomingTasks.length})
        </TextCustom>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 16 }}
        >
          {upcomingTasks.map((task) => (
            <TouchableOpacity
              key={task.worklogId}
              style={[
                styles.card,
                theme.shadow.default,
                { backgroundColor: theme.colors.secondary },
              ]}
              onPress={() =>
                navigation.navigate(ROUTE_NAMES.WORKLOG.WORKLOG_DETAIL, {
                  worklogId: task.worklogId.toString(),
                })
              }
            >
              <TextCustom style={styles.cardTitle}>
                {task.worklogName}
              </TextCustom>
              <View
                style={{ flexDirection: "row", gap: 20, alignItems: "center" }}
              >
                <AvatarList avatars={task.avatarEmployees} />
                <TextCustom style={styles.time}>
                  {formatTime(task.time)}
                </TextCustom>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Completed History */}
      <View style={styles.section}>
        <TextCustom style={styles.sectionTitle}>
          Completed Tasks History
        </TextCustom>
        {completedTasksHistory.map((task) => (
          <View
            key={task.worklogId}
            style={[styles.historyCard, theme.shadow.default]}
          >
            <View style={styles.historyContent}>
              <TextCustom style={styles.historyTitle}>
                {task.worklogName}
              </TextCustom>
              <TextCustom style={styles.historySubtitle}>
                Date: {task.date}
              </TextCustom>
              <AvatarList avatars={task.avatarEmployees} />
            </View>
            <View style={styles.statusBadgeContainer}>
              <StatusBadge status={task.status} />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default EmployeeHomeScreen;
