import theme from "@/theme";
import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexGrow: 1,
    backgroundColor: theme.colors.background,
  },
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 30,
    paddingHorizontal: Platform.OS === "ios" ? 24 : 14,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 50,
    marginBottom: 30,
    gap: 12,
  },
  logo: {
    width: 60,
    height: 60,
  },
  headerText: {
    fontSize: 34,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 4,
  },
  subHeaderText: {
    fontSize: 20,
    color: "#f5f5f5",
  },
  formContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    marginTop: -35,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingTop: 30,
  },
  formContent: {
    paddingHorizontal: 24,
  },
  inputContainer: {
    marginBottom: 12,
  },
  label: {
    marginBottom: 0,
    marginLeft: 17,
    color: theme.colors.primary,
    fontWeight: "600",
    fontSize: 16,
  },
  input: {
    backgroundColor: theme.colors.background,
    padding: -5,
    fontFamily: "BalsamiqSans-Regular",
  },
  inputOutline: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 0,
  },
  signInButton: {
    borderRadius: 8,
    paddingVertical: 8,
    marginBottom: 16,
    backgroundColor: "#4285F4",
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  signUpText: {
    fontSize: 14,
    marginRight: 4,
    color: "#666",
  },
  signUpLink: {
    fontSize: 14,
    color: "#064944",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 14,
    marginTop: 4,
    marginLeft: 12,
    fontStyle: "italic",
  },
  gradientButton: {
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 16,
    marginTop: 20,
  },
  gradientBackground: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  gradientButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
