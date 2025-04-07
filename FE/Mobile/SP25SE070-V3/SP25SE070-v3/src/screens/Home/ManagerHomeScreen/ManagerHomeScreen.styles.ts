import theme from "@/theme";
import { Dimensions, StyleSheet } from "react-native";

const { width: screenWidth } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  header: {
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#888",
    marginLeft: 30,
    marginTop: 10,
  },
  headerUserText: {
    fontSize: 28,
    fontFamily: "BalsamiqSans-Bold",
    marginTop: -20,
    marginLeft: 30,
  },
  subHeaderText: {
    fontSize: 18,
    color: "#FFFFFF",
    marginTop: 5,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "BalsamiqSans-Bold",
    marginBottom: 15,
  },
  alertCard: {
    backgroundColor: "#F6B5B5",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  alertMessage: {
    fontSize: 16,
    fontWeight: "bold",
    color: "red",
  },
  alertAction: {
    fontSize: 14,
    color: "#FFFFFF",
    textDecorationLine: "underline",
  },
  dashboardCard: {
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "rgba(251, 191, 36, 0.5)",
  },
  dashboardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  dashboardItem: {
    alignItems: "center",
    width: (screenWidth - 80) / 2,
  },
  dashboardValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  dashboardLabel: {
    fontSize: 16,
    color: "black",
    marginTop: 5,
  },
  chartContainer: {
    alignItems: "center",
  },
  workCard: {
    padding: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "rgba(255, 149, 0, 0.5)",
  },
  workRow: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 20,
  },
  workItem: {
    alignItems: "center",
    flex: 1,
    backgroundColor: "#d3f0e5",
    paddingBottom: 30,
    borderRadius: 30,
  },
  workValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
  },
  workIcon: {
    marginBottom: 5,
  },
  workLabel: {
    fontSize: 14,
    color: "black",
    marginTop: 5,
    textAlign: "center",
  },
  employeeCard: {
    padding: 20,
    borderRadius: 10,
  },
  employeeSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  employeeSummaryItem: {
    alignItems: "center",
    width: (screenWidth - 80) / 2,
  },
  employeeValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  employeeLabel: {
    fontSize: 14,
    color: "#B0C4DE",
    marginTop: 5,
  },
  topPerformersTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  topPerformerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  topPerformerName: {
    fontSize: 14,
    color: "#FFFFFF",
  },
  topPerformerPerformance: {
    fontSize: 14,
    color: theme.colors.btnYellow,
  },
  manageButton: {
    backgroundColor: theme.colors.btnYellow,
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },
  manageButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  actionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
  },
  actionButton: {
    width: (screenWidth - 55) / 2,
  },
  actionButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "rgba(251, 191, 36, 0.5)",
  },
  actionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginLeft: 10,
  },
});
