import { StyleSheet } from "react-native";
import theme from "@/theme";

export const styles = StyleSheet.create({
  timelineItem: {
    flexDirection: "row",
    marginBottom: 20,
  },
  timelineLeft: {
    width: 30,
    alignItems: "center",
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    borderWidth: 3,
    borderColor: "#E8F5E9",
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: "#ddd",
    marginVertical: 5,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 8,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  timelineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  timelineDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 28,
  },
  timelineNote: {
    flexDirection: "column",
    gap: 10,
  },
  timelineDate: {
    fontSize: 12,
    color: "#A5A5A5",
  },
  timelineAuthor: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  createText: {
    color: "black",
    fontWeight: "500",
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  timelineText: {
    fontSize: 14,
    fontWeight: "500",
    fontFamily: "BalsamiqSans-Bold",
  },
  issueText: {
    fontSize: 14,
    fontWeight: "300",
  },
  detailButton: {
    backgroundColor: "#BCD379",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 10,
  },
  detailButtonText: {
    color: "064944",
    fontSize: 14,
    fontWeight: "500",
  },
});
