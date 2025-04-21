import theme from "@/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },
  dateGroup: {
    flexDirection: "row",
  },
  timelineLeft: {
    width: 60,
    alignItems: "center",
  },
  dateText: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: 5,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.btnYellow,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: theme.colors.primary,
    marginTop: 5,
  },
  recordsContainer: {
    flex: 1,
  },
  filterContainer: {
    flexDirection: "column",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
});
