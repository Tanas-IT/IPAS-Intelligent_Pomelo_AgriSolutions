import theme from "@/theme";
import CustomIcon from "components/CustomIcon";
import TextCustom from "components/TextCustom";
import { StyleSheet, View } from "react-native";

export const StatBox = ({ icon, color, value, label }: { icon: string; color: string; value: number; label: string }) => (
    <View style={[styles.statBox, theme.shadow.default]}>
      <CustomIcon name={icon} size={30} color={color} type='Ionicons' />
      <TextCustom style={styles.statNumber}>{value}</TextCustom>
      <TextCustom style={styles.statLabel}>{label}</TextCustom>
    </View>
  );

const styles = StyleSheet.create({
    statBox: {
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        elevation: 2,
        flex: 1,
        marginHorizontal: 5,
        width: 110,
      },
      statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 5
      },
      statLabel: {
        fontSize: 14,
        color: '#666'
      },
})