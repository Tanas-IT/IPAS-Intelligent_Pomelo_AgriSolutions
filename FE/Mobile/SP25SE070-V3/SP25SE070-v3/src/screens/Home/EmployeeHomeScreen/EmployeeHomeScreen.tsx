import React, { useEffect, useState, useRef } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { LineChart, BarChart } from "react-native-chart-kit";
import Toast from "react-native-toast-message";
import { TextCustom, CustomIcon } from "@/components";
import theme from "@/theme";
import TimeFilterModal from "./TimeFilterModal";
import { StatBox } from "../components/StatBox";

const { width, height } = Dimensions.get("window");

const mockTodaysTasks = {
  statusCode: 200,
  message: "Success",
  data: [
    {
      worklogId: 104,
      worklogName: "Harvest Block A",
      status: "pending",
      priority: "high",
      timeSlot: "08:00-10:00",
    },
    {
      worklogId: 105,
      worklogName: "Tưới cây khu B",
      status: "pending",
      priority: "medium",
      timeSlot: "14:00-15:00",
    },
    {
      worklogId: 106,
      worklogName: "Kiểm tra sâu bệnh khu C",
      status: "done",
      priority: "low",
      timeSlot: "10:30-11:00",
    },
  ],
};

const EmployeeHomeScreen = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [todaysTasks, setTodaysTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeFilterVisible, setTimeFilterVisible] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const fullName = "Tran Van B";

  const fetchData = async (filters: { timeRange?: string } = {}) => {
    setLoading(true);
    try {
      const metricsResponse = {
        statusCode: 200,
        message: "Success",
        data: {
          tasksCompleted: filters.timeRange === "today" ? 3 : filters.timeRange === "month" ? 50 : 18,
          hoursWorked: filters.timeRange === "today" ? 6.0 : filters.timeRange === "month" ? 120.0 : 42.5,
          skillScore: filters.timeRange === "today" ? 90 : filters.timeRange === "month" ? 88 : 90,
          aiReportsSubmitted: filters.timeRange === "today" ? 1 : filters.timeRange === "month" ? 30 : 12,
          aiReportsAnswered: filters.timeRange === "today" ? 0 : filters.timeRange === "month" ? 25 : 10,
          tasksPendingToday: 5,
          chartData: {
            tasks: filters.timeRange === "month"
              ? [
                { label: "Tuần 1", count: 12 },
                { label: "Tuần 2", count: 10 },
                { label: "Tuần 3", count: 15 },
                { label: "Tuần 4", count: 13 },
              ]
              : [
                { label: "09/04", count: 3 },
                { label: "10/04", count: 2 },
                { label: "11/04", count: 4 },
                { label: "12/04", count: 1 },
                { label: "13/04", count: 3 },
                { label: "14/04", count: 2 },
                { label: "15/04", count: 3 },
              ],
          },
        },
      };

      const todaysTasksResponse = mockTodaysTasks;

      setMetrics(metricsResponse.data);
      setTodaysTasks(todaysTasksResponse.data);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Lỗi",
        text2: "Không tải được dữ liệu",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderTodaysTasks = () => {
    if (!todaysTasks.length) {
      return (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TextCustom style={styles.sectionTitle}>Today's Tasks</TextCustom>
          </View>
          <View style={styles.noDataContainer}>
            <CustomIcon name="clipboard-text-outline" size={48} color="#D1D5DB" />
            <TextCustom style={styles.noDataText}>No tasks for today</TextCustom>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <TextCustom style={styles.sectionTitle}>Today's Tasks</TextCustom>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.taskScrollContainer}
        >
          {todaysTasks.map((item) => {
            const priorityColor =
              item.priority === "high"
                ? "#F87171"
                : item.priority === "medium"
                  ? "#FBBF24"
                  : "#34D399";
            const statusColor = item.status === "done" ? "#34D399" : "#9CA3AF";
            const statusText = item.status === "done" ? "Completed" : "Pending";

            return (
              <View key={`task-${item.worklogId}`} style={styles.taskCard}>
                <View style={styles.taskHeader}>
                  <View style={[styles.taskStatusDot, { backgroundColor: statusColor }]} />
                  <TextCustom style={styles.taskTime}>{item.timeSlot || "Flexible"}</TextCustom>
                </View>
                <TextCustom style={styles.taskTitle} numberOfLines={2}>
                  {item.worklogName}
                </TextCustom>
                <View style={styles.taskFooter}>
                  <View style={[styles.priorityBadge, { backgroundColor: priorityColor }]}>
                    <TextCustom style={styles.priorityText}>
                      {item.priority === "high" ? "High" : item.priority === "medium" ? "Medium" : "Low"}
                    </TextCustom>
                  </View>
                  <TextCustom style={[styles.taskStatus, { color: statusColor }]}>
                    {statusText}
                  </TextCustom>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderChart = () => {
    if (!metrics || !metrics.chartData.tasks.length) return null;

    const chartData = {
      labels: metrics.chartData.tasks.map((d: any) => d.label),
      datasets: [
        {
          data: metrics.chartData.tasks.map((d: any) => d.count),
          colors: metrics.chartData.tasks.map((_: any, i: any) => 
            `rgba(99, 102, 241, ${0.7 + (i * 0.05)})`
          ),
        },
      ],
    };

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <TextCustom style={styles.sectionTitle}>Performance Trends</TextCustom>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setTimeFilterVisible(true)}
          >
            <CustomIcon
              name="tune"
              size={24}
              color="#20461e"
              type="MaterialIcons"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.chartContainer}>
          <LineChart
            data={chartData}
            width={width - 40}
            height={220}
            withVerticalLines={true}
            withHorizontalLines={true}
            withShadow={false}
            withDots={true}
            withInnerLines={true}
            withOuterLines={true}
            chartConfig={{
              backgroundGradientFrom: "#FFF",
              backgroundGradientTo: "#FFF",
              decimalPlaces: 0,
              color: () => theme.colors.primary,
              labelColor: () => "#6B7280",
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: "5",
                strokeWidth: "2",
                stroke: theme.colors.primary,
                fill: "#FFF",
              },
              propsForBackgroundLines: {
                strokeDasharray: "",
                stroke: "#E5E7EB",
              },
            }}
            bezier
            style={styles.chart}
          />
        </View>
      </View>
    );
  };

  const renderStats = () => {
    if (!metrics) return null;

    return (
      <View style={styles.statsSection}>
        <View style={styles.statsRow}>
          <StatBox
            icon="checkmark-circle"
            color="#10B981"
            value={metrics.tasksCompleted}
            label="Tasks Done"
          />
          <StatBox
            icon="hourglass-outline"
            color="#3B82F6"
            value={metrics.hoursWorked.toFixed(1)}
            label="Hours Worked"
          />
        </View>
        <View style={styles.statsRow}>
          <StatBox
            icon="star"
            color="#F59E0B"
            value={metrics.skillScore}
            label="Skill Score"
          />
          <StatBox
            icon="document-text-outline"
            color="#8B5CF6"
            value={metrics.aiReportsSubmitted}
            label="AI Reports"
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header]}>
        <LinearGradient
          colors={['#bcd379', '#72BA7A', '#20461e']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <View style={styles.userInfo}>
              <View style={styles.avatarPlaceholder}>
                <CustomIcon name="user" size={32} color="#FFF" type="AntDesign" />
              </View>
              <View>
                <TextCustom style={styles.headerGreeting}>Hello,</TextCustom>
                <TextCustom style={styles.headerUserName}>{fullName}</TextCustom>
              </View>
            </View>

            <View style={styles.performanceContainer}>
              <View style={styles.performanceItem}>
                <TextCustom style={styles.performanceLabel}>Today's Tasks</TextCustom>
                <TextCustom style={styles.performanceValue}>{metrics?.tasksPendingToday || 0}</TextCustom>
              </View>
              <View style={styles.performanceDivider} />
              <View style={styles.performanceItem}>
                <TextCustom style={styles.performanceLabel}>Skill Score</TextCustom>
                <TextCustom style={styles.performanceValue}>{metrics?.skillScore || 0}</TextCustom>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <ScrollView
        style={styles.content}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.contentInner}>
          {renderStats()}
          {renderTodaysTasks()}
          {renderChart()}
        </View>
      </ScrollView>

      <TimeFilterModal
        visible={timeFilterVisible}
        onApply={(timeRange) => {
          fetchData({ timeRange });
          setTimeFilterVisible(false);
        }}
        onClose={() => setTimeFilterVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fffcee",
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: 'hidden',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  headerGradient: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerContent: {
    flex: 1,
    // justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerGreeting: {
    fontSize: 14,
    color: 'white',
    marginBottom: 2,
  },
  headerUserName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF',
  },
  performanceContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  performanceItem: {
    flex: 1,
    alignItems: 'center',
  },
  performanceDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 4,
  },
  performanceLabel: {
    fontSize: 12,
    color: '#20461e',
    marginBottom: 4,
  },
  performanceValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#bcd379',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 230 : 80,
  },
  contentInner: {
    paddingBottom: 150,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  sectionAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionActionText: {
    fontSize: 14,
    color: theme.colors.primary,
    marginRight: 4,
  },
  noDataContainer: {
    paddingVertical: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  taskScrollContainer: {
    paddingVertical: 4,
  },
  taskCard: {
    width: 180,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  taskTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 12,
    height: 40,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priorityBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '500',
  },
  taskStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  statsSection: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  statBoxFirst: {
    marginRight: 12,
  },
  chartContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});

export default EmployeeHomeScreen;