import theme from "@/theme";
import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fffcee",
  },
  content: {
    paddingHorizontal: 15,
  },
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
  timelineNote: {
    flexDirection: "column",
    gap: 10,
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
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    marginTop: 15,
    color: "#999",
    fontSize: 16,
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 28,
  },

  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.primary,
    marginBottom: 15,
  },
  modalImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginRight: 10,
  },
  closeButton: {
    backgroundColor: "#BCD379",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginTop: 15,
  },
  closeButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: "500",
  },
  filterContainer: {
    flexDirection: "column",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 8,
    // backgroundColor: "white",
    marginHorizontal: 15,
    marginTop: 10,
    // marginBottom: 10,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: Platform.OS === "ios" ? 1 : 0,
  },
  resetButton: {
    marginLeft: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "white",
    borderRadius: 6,
  },
  resetButtonText: {
    color: "#064944",
    fontSize: 14,
    fontWeight: "500",
  },
  recordCount: {
    marginVertical: 10,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  footer: {
    padding: 15,
    alignItems: "center",
  },
});
