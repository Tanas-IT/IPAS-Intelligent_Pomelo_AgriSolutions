import theme from "@/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  header: {
    height: 220,
    backgroundColor: "white",
    // position: 'relative',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 16,
    paddingBottom: 20,
  },
  qrContainer: {
    backgroundColor: "white",
    padding: 4,
    borderRadius: 8,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  plantName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 4,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  plantCode: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 12,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusHealthy: {
    borderColor: theme.colors.statusHealthyBorder,
    backgroundColor: theme.colors.statusHealthyBg,
  },
  statusMinorIssue: {
    backgroundColor: theme.colors.statusMinorIssueBg,
    borderColor: theme.colors.statusMinorIssueBorder,
  },
  statusSeriousIssue: {
    backgroundColor: theme.colors.statusSeriousIssueBg,
    borderColor: theme.colors.statusSeriousIssueBorder,
  },
  statusDead: {
    backgroundColor: theme.colors.statusDeadBg,
  },
  statusText: {
    color: "white",
    fontWeight: "600",
    fontSize: 13,
  },
  textHealthy: {
    color: theme.colors.statusHealthyText,
  },
  textMinorIssue: {
    color: theme.colors.statusMinorIssueText,
  },
  textSeriousIssue: {
    color: theme.colors.statusSeriousIssueText,
  },
  textDead: {
    color: theme.colors.statusDeadText,
  },
  spacer: {
    flex: 1,
  },
  growthStageBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  growthStageText: {
    color: "#333",
    fontWeight: "600",
    fontSize: 13,
    marginLeft: 6,
    maxWidth: 125,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 16,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    padding: 8,
    borderRadius: 20,
  },
});
