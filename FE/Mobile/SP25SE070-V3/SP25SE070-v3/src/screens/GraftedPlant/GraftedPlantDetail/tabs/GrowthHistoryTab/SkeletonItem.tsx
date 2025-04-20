import { View } from "native-base";
import { styles } from "./GrowthHistoryTab.styles";

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
