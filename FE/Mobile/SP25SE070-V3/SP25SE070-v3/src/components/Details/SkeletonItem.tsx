import { View } from "native-base";
import { styles } from "./Details.styles";

export const SkeletonItem = () => (
  <View style={styles.timelineItem}>
    <View style={styles.timelineLeft}>
      <View style={[styles.timelineDot, { backgroundColor: "#ccc" }]} />
      <View style={[styles.timelineLine, { backgroundColor: "#eee" }]} />
    </View>
    <View style={styles.timelineContent}>
      <View style={styles.timelineHeader}>
        <View style={styles.timelineDateContainer}>
          <View style={[styles.avatar, { backgroundColor: "#eee" }]} />
          <View style={{ flexDirection: "column", gap: 8 }}>
            <View style={{ width: 100, height: 16, backgroundColor: "#eee" }} />
            <View style={{ width: 80, height: 12, backgroundColor: "#eee" }} />
          </View>
        </View>
      </View>
      <View style={styles.timelineNote}>
        <View
          style={{
            width: "80%",
            height: 16,
            backgroundColor: "#eee",
            marginBottom: 8,
          }}
        />
        <View style={{ width: "60%", height: 16, backgroundColor: "#eee" }} />
      </View>
    </View>
  </View>
);

// const styles = StyleSheet.create({
//   timelineItem: {
//     flexDirection: "row",
//     marginBottom: 20,
//   },
//   timelineLeft: {
//     width: 30,
//     alignItems: "center",
//   },
//   timelineDot: {
//     width: 16,
//     height: 16,
//     borderRadius: 8,
//     backgroundColor: theme.colors.primary,
//     borderWidth: 3,
//     borderColor: "#E8F5E9",
//   },
//   timelineLine: {
//     flex: 1,
//     width: 2,
//     backgroundColor: "#ddd",
//     marginVertical: 5,
//   },
//   timelineContent: {
//     flex: 1,
//     backgroundColor: "white",
//     borderRadius: 8,
//     padding: 15,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
//     elevation: 1,
//   },
//   timelineHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 10,
//   },
//   timelineDateContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//   },
//   avatar: {
//     width: 26,
//     height: 26,
//     borderRadius: 28,
//   },
//   timelineNote: {
//     flexDirection: "column",
//     gap: 10,
//   },
// });

export default SkeletonItem;
