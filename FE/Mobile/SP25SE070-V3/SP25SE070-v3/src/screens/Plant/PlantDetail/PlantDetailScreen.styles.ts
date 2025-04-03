import theme from "@/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffcee',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
  },
  tabItem: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    minWidth: 60,
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 5,
    color: theme.colors.primary,
  },
  activeLabel: {
    color: 'white',
    fontWeight: '600',
  },
  tabContent: {
    flex: 1,
  },
});