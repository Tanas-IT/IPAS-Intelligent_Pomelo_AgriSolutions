import theme from "@/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },

  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: 24,
    textAlign: "center",
    marginTop: 20,
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  cardContainer: {
    marginBottom: 40,
    alignItems: "center",
  },
  imageContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: "white",
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1,
    marginBottom: -30,
  },
  farmImage: {
    width: "100%",
    height: "100%",
    borderRadius: 45,
  },
  card: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    paddingTop: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inactiveCard: {
    opacity: 0.7,
  },
  cardContent: {
    paddingTop: 10,
  },
  farmName: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.primary,
    textAlign: "center",
    marginBottom: 8,
  },
  addressContainer: {
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  addressText: {
    maxWidth: 220,
    flexWrap: "wrap",
    fontSize: 14,
    color: theme.colors.primary,
    textAlign: "center",
    marginBottom: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#27ae60",
  },
  statLabel: {
    fontSize: 14,
    color: "#7f8c8d",
    marginTop: 4,
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  infoItem: {
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2c3e50",
  },
  statusTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    fontWeight: "bold",
    alignSelf: "flex-start",
    overflow: "hidden",
  },
  activeTag: {
    backgroundColor: theme.colors.activeTagBackground,
    borderColor: theme.colors.activeTagBorder,
  },
  inactiveTag: {
    backgroundColor: theme.colors.inactiveTagBackground,
    borderColor: theme.colors.inactiveTagBorder,
  },
  statusText: {
    fontWeight: "bold",
    fontSize: 12,
  },
  activeText: {
    color: theme.colors.activeTextColor,
  },
  inactiveText: {
    color: theme.colors.inactiveTextColor,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  roleText: {
    fontSize: 14,
    color: "#3498db",
    fontWeight: "500",
  },
  dateText: {
    fontSize: 12,
    color: "#7f8c8d",
  },

  owner: {
    backgroundColor: theme.colors.color_bg_tag_owner,
  },
  ownerText: {
    color: theme.colors.color_tag_owner,
    borderColor: "transparent",
  },
  other: {
    backgroundColor: theme.colors.color_bg_tag_other,
  },
  otherText: {
    color: theme.colors.color_tag_other,
    borderColor: "transparent",
  },
});
