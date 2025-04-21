import { StyleSheet } from "react-native";
import MainApp from "./src";
import { ActionSheetProvider } from "@expo/react-native-action-sheet";

export default function App() {
  return (
    <ActionSheetProvider>
      <MainApp />
    </ActionSheetProvider>
  );
}
