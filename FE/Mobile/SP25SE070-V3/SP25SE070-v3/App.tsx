import { StyleSheet } from "react-native";
import MainApp from "./src";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";
import { LogBox } from "react-native";

LogBox.ignoreLogs(["Possible Unhandled Promise Rejection"]);
LogBox.ignoreAllLogs();
export default function App() {
  return (
    <ActionSheetProvider>
      <MainApp />
    </ActionSheetProvider>
  );
}
