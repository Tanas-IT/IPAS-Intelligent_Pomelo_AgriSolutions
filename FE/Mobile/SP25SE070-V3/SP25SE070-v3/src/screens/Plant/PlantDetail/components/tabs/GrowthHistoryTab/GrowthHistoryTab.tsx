import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { PlantDetailData, PlantGrowthHistory } from "@/types/plant";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import { RootStackNavigationProp } from "@/constants/Types";
import NoteDetailModal from "../../NoteDetailModal";
import { ROUTE_NAMES } from "@/constants/RouteNames";
import { styles } from "./GrowthHistoryTab.styles";
import { CustomIcon, TextCustom } from "@/components";
import { avt } from "@/assets/images";

const currentUser = "John Doe";

const GrowthHistoryTab: React.FC<{ plant: PlantDetailData }> = ({ plant }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedHistory, setSelectedHistory] =
    useState<PlantGrowthHistory | null>(null);
  const navigation = useNavigation<RootStackNavigationProp>();

  const handleDelete = (historyId: number) => {
    Toast.show({
      type: "success",
      text1: "Note Deleted",
      text2: "The note has been successfully deleted.",
    });
  };

  const processResources = (resources?: string[]) => {
    if (!resources) return { images: [], videos: [] };
    const images = resources.filter((url) =>
      /\.(jpg|jpeg|png|gif)$/i.test(url)
    );
    const videos = resources.filter((url) => /\.(mp4|mov|avi)$/i.test(url));
    return { images, videos };
  };

  const showDetailModal = (history: PlantGrowthHistory) => {
    setSelectedHistory({
      ...history,
      ...processResources(history.plantResources),
    });
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() =>
          navigation.navigate(ROUTE_NAMES.PLANT.ADD_NOTE, {
            plantId: plant.plantId,
          })
        }
      >
        <CustomIcon
          name="plus"
          size={24}
          color="#064944"
          type="MaterialCommunityIcons"
        />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.content}>
        {plant.growthHistory.length > 0 ? (
          plant.growthHistory.map((history, index) => (
            <View
              key={history.plantGrowthHistoryId}
              style={styles.timelineItem}
            >
              <View style={styles.timelineLeft}>
                <View style={styles.timelineDot} />
                {index < plant.growthHistory.length - 1 && (
                  <View style={styles.timelineLine} />
                )}
              </View>

              <View style={styles.timelineContent}>
                <View style={styles.timelineHeader}>
                  <View style={styles.timelineDateContainer}>
                    <Image source={avt} style={styles.avatar} />
                    <View style={{ flexDirection: "column" }}>
                      <View style={{ flexDirection: "row", gap: 10 }}>
                        <TextCustom style={styles.timelineAuthor}>
                          {history.noteTaker}
                        </TextCustom>
                        <TextCustom style={styles.createText}>
                          created this note
                        </TextCustom>
                      </View>
                      <TextCustom style={styles.timelineDate}>
                        {new Date(history.createDate).toLocaleDateString()}
                      </TextCustom>
                    </View>
                  </View>

                  {/* edit/delete nếu là note của user */}
                  {history.noteTaker === currentUser && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate(ROUTE_NAMES.PLANT.ADD_NOTE, {
                            plantId: plant.plantId,
                            historyId: history.plantGrowthHistoryId,
                            initialData: {
                              content: history.content,
                              issueName: history.issueName,
                              images: history.plantResources,
                            },
                          })
                        }
                      >
                        <CustomIcon
                          name="pencil"
                          size={20}
                          color="#064944"
                          type="MaterialCommunityIcons"
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          handleDelete(history.plantGrowthHistoryId)
                        }
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
                    <View>
                      <TextCustom style={styles.timelineText}>
                        Issues:
                      </TextCustom>
                      <TextCustom style={styles.issueText}>
                        {history.issueName}
                      </TextCustom>
                    </View>
                  )}

                  {history.content && (
                    <View>
                      <TextCustom style={styles.timelineText}>
                        Notes:
                      </TextCustom>
                      <TextCustom style={styles.issueText}>
                        {history.content}
                      </TextCustom>
                    </View>
                  )}

                  {/* nếu có hình ảnh -> nút detail */}
                  {history.plantResources &&
                    history.plantResources.length > 0 && (
                      <TouchableOpacity
                        style={styles.detailButton}
                        onPress={() => showDetailModal(history)}
                      >
                        <TextCustom style={styles.detailButtonText}>
                          View Details
                        </TextCustom>
                      </TouchableOpacity>
                    )}
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <CustomIcon
              name="text"
              size={40}
              color="#ccc"
              type="MaterialCommunityIcons"
            />
            <TextCustom style={styles.emptyText}>
              No growth history recorded yet
            </TextCustom>
          </View>
        )}
      </ScrollView>

      <NoteDetailModal
        visible={modalVisible}
        history={selectedHistory}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
};

export default GrowthHistoryTab;
