import React, { useEffect, useState } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { PieChart } from "react-native-chart-kit";
import Toast from "react-native-toast-message";
import theme from "@/theme";
import { ROUTE_NAMES } from "@/constants/RouteNames";
import { RootStackNavigationProp } from "@/constants/Types";
import WorkItem from "../components/WorkItem";
import { styles } from "./ManagerHomeScreen.styles";
import { TextCustom } from "@/components";
import { useAuthStore } from "@/store";
import { dashboardService } from "@/services";
import { UserRolesStr } from "@/constants";

const { width: screenWidth } = Dimensions.get("window");

interface Alert {
  id: number;
  message: string;
  action?: string;
  route?: string;
}

interface FarmOverview {
  totalPlants: string;
  totalYield: string;
  healthyTrees: number;
  diseasedTrees: number;
}

interface WorkOverview {
  rejected: number;
  redo: number;
  needFeedback: number;
  overdue: number;
}

const ManagerHomeScreen = () => {
  const { fullName, accessToken, roleId } = useAuthStore();

  const navigation = useNavigation<RootStackNavigationProp>();
  const [warnings, setWarnings] = useState<Alert[]>([]);
  const [farmOverview, setFarmOverview] = useState<FarmOverview>({
    totalPlants: "0",
    totalYield: "0 kg",
    healthyTrees: 0,
    diseasedTrees: 0,
  });
  const [workOverview, setWorkOverview] = useState<WorkOverview>({
    rejected: 0,
    redo: 0,
    needFeedback: 0,
    overdue: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchManagerHome = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getManagerHome(); // farmId=1

        // Ánh xạ warnings sang alerts
        setWarnings(
          data.warning.map((msg, index) => ({
            id: index + 1,
            message: msg,
            action: "View Details",
            route: ROUTE_NAMES.MAIN.MAIN_TABS,
          }))
        );

        // Ánh xạ farmOverview
        setFarmOverview({
          totalPlants: data.farmOverview.totalPlants.toLocaleString(),
          totalYield: `${data.farmOverview.totalYield.toLocaleString()} kg`,
          healthyTrees: data.farmOverview.normalPercentage,
          diseasedTrees: data.farmOverview.deadPercentage,
        });

        // Ánh xạ workOverview
        const workStatusMap: { [key: string]: number } = {
          Cancelled: 0,
          Redo: 0,
          Reviewing: 0,
          Overdue: 0,
        };
        data.workOverview.forEach((item) => {
          workStatusMap[item.status] = item.count;
        });
        setWorkOverview({
          rejected: workStatusMap.Cancelled,
          redo: workStatusMap.Redo,
          needFeedback: workStatusMap.Reviewing,
          overdue: workStatusMap.Overdue,
        });
      } finally {
        // catch (error: any) {
        //   console.error("Error fetching manager home:", error);
        // }
        setLoading(false);
      }
    };

    fetchManagerHome();
  }, []);

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
        <TextCustom style={styles.headerUserText}>{fullName}</TextCustom>
        <TextCustom style={styles.headerText}>Welcome Back!</TextCustom>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
          style={{ marginVertical: 50 }}
        />
      ) : (
        <>
          {/* Alerts */}
          {warnings.length > 0 && (
            <View style={styles.section}>
              <TextCustom style={styles.sectionTitle}>Alerts</TextCustom>
              {warnings.map((alert) => (
                <TouchableOpacity
                  key={alert.id}
                  style={[styles.alertCard, theme.shadow.default]}
                  onPress={() =>
                    alert.route && navigation.navigate(alert.route as any)
                  }
                >
                  <TextCustom style={styles.alertMessage}>
                    {alert.message}
                  </TextCustom>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Farm Overview */}
          <View style={styles.section}>
            <TextCustom style={styles.sectionTitle}>Farm Overview</TextCustom>
            <LinearGradient
              colors={["#268555", "#4ca784"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.dashboardCard, theme.shadow.default]}
            >
              <View style={styles.dashboardRow}>
                <View style={styles.dashboardItem}>
                  <TextCustom style={styles.dashboardValue}>
                    {farmOverview.totalPlants}
                  </TextCustom>
                  <TextCustom style={styles.dashboardLabel}>
                    Total Plants
                  </TextCustom>
                </View>
                <View style={styles.dashboardItem}>
                  <TextCustom style={styles.dashboardValue}>
                    {farmOverview.totalYield}
                  </TextCustom>
                  <TextCustom style={styles.dashboardLabel}>
                    Total Yield
                  </TextCustom>
                </View>
              </View>
              <View style={styles.chartContainer}>
                <PieChart
                  data={[
                    {
                      name: "Healthy",
                      population: farmOverview.healthyTrees,
                      color: theme.colors.btnYellow,
                      legendFontColor: "#FFFFFF",
                      legendFontSize: 14,
                    },
                    {
                      name: "Unhealthy",
                      population: farmOverview.diseasedTrees,
                      color: "#FF6F61",
                      legendFontColor: "#FFFFFF",
                      legendFontSize: 14,
                    },
                  ]}
                  width={screenWidth - 40}
                  height={200}
                  chartConfig={{
                    backgroundColor: "transparent",
                    backgroundGradientFrom: "transparent",
                    backgroundGradientTo: "transparent",
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  }}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
              </View>
            </LinearGradient>
          </View>

          {/* Work Overview */}
          <View style={styles.section}>
            <TextCustom style={styles.sectionTitle}>Work Overview</TextCustom>
            <View style={styles.workRow}>
              <WorkItem
                iconName="close-circle-outline"
                value={workOverview.rejected}
                label="Rejected"
                // onPress={() => navigation.navigate(ROUTE_NAMES.WORKLOG.WORKLOG_LIST, { filter: 'rejected' })}
              />
              <WorkItem
                iconName="refresh-outline"
                value={workOverview.redo}
                label="Redo"
                // onPress={() => navigation.navigate(ROUTE_NAMES.WORKLOG.WORKLOG_LIST, { filter: 'redo' })}
              />
            </View>
            <View style={styles.workRow}>
              <WorkItem
                iconName="chatbubble-outline"
                value={workOverview.needFeedback}
                label="Need Feedback"
              />
              <WorkItem
                iconName="warning-outline"
                value={workOverview.overdue}
                label="Overdue"
              />
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
};

export default ManagerHomeScreen;
