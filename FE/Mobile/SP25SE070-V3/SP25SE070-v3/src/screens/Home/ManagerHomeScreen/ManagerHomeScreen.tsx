import React from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { PieChart } from "react-native-chart-kit";
import theme from "@/theme";
import { ROUTE_NAMES } from "@/constants/RouteNames";
import { RootStackNavigationProp } from "@/constants/Types";
import WorkItem from "../components/WorkItem";
import { styles } from "./ManagerHomeScreen.styles";
import { TextCustom } from "@/components";
import { useAuthStore } from "@/store";

const { width: screenWidth } = Dimensions.get("window");

const farmOverview = {
  totalTrees: "1,250",
  totalYield: "3,500 kg",
  healthyTrees: 95,
  diseasedTrees: 5,
};

const workOverview = {
  rejected: 2,
  redo: 3,
  needFeedback: 5,
  overdue: 2,
};

const alerts = [
  {
    id: 1,
    message:
      "Severe weather warning: Heavy rain and strong winds expected in your area.",
    action: "View Details",
    route: ROUTE_NAMES.MAIN.MAIN_TABS,
  },
  {
    id: 2,
    message: "Strong winds and possible flooding in your area.",
    action: "Manage Tasks",
    route: ROUTE_NAMES.MAIN.MAIN_TABS,
  },
];

const ManagerHomeScreen = () => {
  const { fullName } = useAuthStore();
  const navigation = useNavigation<RootStackNavigationProp>();

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

      {/* Alerts */}
      {alerts.length > 0 && (
        <View style={styles.section}>
          <TextCustom style={styles.sectionTitle}>Alerts</TextCustom>
          {alerts.map((alert) => (
            <TouchableOpacity
              key={alert.id}
              style={[styles.alertCard, theme.shadow.default]}
            >
              <TextCustom style={styles.alertMessage}>
                {alert.message}
              </TextCustom>
            </TouchableOpacity>
          ))}
        </View>
      )}

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
                {farmOverview.totalTrees}
              </TextCustom>
              <TextCustom style={styles.dashboardLabel}>Total Trees</TextCustom>
            </View>
            <View style={styles.dashboardItem}>
              <TextCustom style={styles.dashboardValue}>
                {farmOverview.totalYield}
              </TextCustom>
              <TextCustom style={styles.dashboardLabel}>Total Yield</TextCustom>
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

      {/* Farm Overview */}
    </ScrollView>
  );
};

export default ManagerHomeScreen;
