import { SYSTEM_CONFIG_GROUP, SYSTEM_CONFIG_KEY } from "@/constants";
import { useModifyPermission, useSystemConfigOptions } from "@/hooks";
import { GetPlantGrowthHistory } from "@/payloads";
import { View } from "native-base";
import { CustomIcon, TextCustom } from "@/components";
import { formatDateAndTime } from "@/utils";
import { TouchableOpacity, Image } from "react-native";
import { styles } from "./Details.styles";

interface TimelineItemProps {
  history: GetPlantGrowthHistory;
  isDead: boolean;
  index: number;
  totalItems: number;
  onEdit: (history: GetPlantGrowthHistory) => void;
  onDelete: (historyId: number) => void;
  showDetailModal: (history: GetPlantGrowthHistory) => void;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({
  history,
  isDead,
  index,
  totalItems,
  onEdit,
  onDelete,
  showDetailModal,
}) => {
  const { options, loading } = useSystemConfigOptions(
    SYSTEM_CONFIG_GROUP.VALIDATION_VARIABLE,
    SYSTEM_CONFIG_KEY.EDIT_IN_DAY,
    true
  );
  const limitDays = parseInt(String(options?.[0]?.label || "0"), 10);

  const { canEdit } = useModifyPermission(
    history.createDate,
    history.userId,
    limitDays,
    loading
  );

  return (
    <View style={styles.timelineItem}>
      <View style={styles.timelineLeft}>
        <View style={styles.timelineDot} />
        {index < totalItems - 1 && <View style={styles.timelineLine} />}
      </View>
      <View style={styles.timelineContent}>
        <View style={styles.timelineHeader}>
          <View style={styles.timelineDateContainer}>
            <Image
              source={{ uri: history.noteTakerAvatar }}
              style={styles.avatar}
            />
            <View style={{ flexDirection: "column" }}>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TextCustom style={styles.timelineAuthor}>
                  {history.noteTakerName}
                </TextCustom>
                <TextCustom style={styles.createText}>
                  created this note
                </TextCustom>
              </View>
              <TextCustom style={styles.timelineDate}>
                {formatDateAndTime(history.createDate)}
              </TextCustom>
            </View>
          </View>
          {canEdit && !isDead && (
            <View style={styles.actionButtons}>
              <TouchableOpacity onPress={() => onEdit(history)}>
                <CustomIcon
                  name="pencil"
                  size={20}
                  color="#064944"
                  type="MaterialCommunityIcons"
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onDelete(history.plantGrowthHistoryId)}
                style={{ marginLeft: 10 }}
              >
                <CustomIcon
                  name="delete"
                  size={20}
                  color="#F44336"
                  type="MaterialCommunityIcons"
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
        <View style={styles.timelineNote}>
          {history.issueName && (
            <View style={styles.row}>
              <TextCustom style={styles.timelineText}>Issues:</TextCustom>
              <TextCustom style={styles.issueText}>
                {history.issueName}
              </TextCustom>
            </View>
          )}
          {history.content && (
            <View style={styles.row}>
              <TextCustom style={styles.timelineText}>Note:</TextCustom>
              <TextCustom style={styles.issueText}>
                {history.content}
              </TextCustom>
            </View>
          )}
          <View style={styles.row}>
            <TextCustom style={styles.timelineText}>Media:</TextCustom>
            <TextCustom style={styles.issueText}>
              {history.numberImage} Images | {history.numberVideos} Videos
            </TextCustom>
          </View>
          {history.resources && history.resources.length > 0 && (
            <TouchableOpacity
              style={styles.detailButton}
              onPress={() => showDetailModal(history)}
            >
              <TextCustom style={styles.detailButtonText}>
                View Medias
              </TextCustom>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default TimelineItem;
