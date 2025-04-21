import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Pressable,
  Modal,
} from "react-native";
import CustomIcon from "./CustomIcon";
import { useVideoPlayer, VideoView } from "expo-video";
import TextCustom from "./TextCustom";
import theme from "@/theme";

interface CommonResource {
  resourceID: number;
  resourceURL: string;
  fileFormat: string;
}

interface NoteDetailModalProps {
  visible: boolean;
  resources: CommonResource[] | null;
  onClose: () => void;
}

const VideoThumbnail: React.FC<{
  videoUrl: string;
  onSelect: (url: string) => void;
}> = ({ videoUrl, onSelect }) => {
  const player = useVideoPlayer(videoUrl, (player) => {
    player.loop = false;
    player.muted = true;
  });

  return (
    <TouchableOpacity
      onPress={() => onSelect(videoUrl)}
      style={styles.thumbnailContainer}
    >
      <VideoView
        player={player}
        style={styles.videoThumbnail}
        nativeControls={false}
      />
      <CustomIcon
        name="play-circle"
        size={30}
        color="#fff"
        type="MaterialCommunityIcons"
      />
    </TouchableOpacity>
  );
};

const NoteDetailModal: React.FC<NoteDetailModalProps> = ({
  visible,
  resources,
  onClose,
}) => {
  const flatListRef = useRef<FlatList>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);

  const getFormat = (res: CommonResource): string => {
    if (res.fileFormat) {
      return res.fileFormat.toLowerCase();
    }
    const url = res.resourceURL.toLowerCase();
    const match = url.match(/\.([a-z0-9]+)(?:[\?#]|$)/i);
    return match && match[1] ? match[1] : "unknown";
  };
  // Phân loại resources thành images và videos
  const processResources = (resources: CommonResource[] | null) => {
    if (!resources || resources.length === 0) return { images: [], videos: [] };

    const images: string[] = [];
    const videos: string[] = [];

    resources.forEach((res) => {
      // const format = res.fileFormat.toLowerCase();
      const format = getFormat(res);
      const url = res.resourceURL.toLowerCase();

      // Kiểm tra fileFormat cụ thể
      if (["jpg", "jpeg", "png", "gif"].includes(format)) {
        images.push(res.resourceURL);
      } else if (["mp4", "mov", "avi"].includes(format)) {
        videos.push(res.resourceURL);
      }
      // Kiểm tra fileFormat chung ("image", "video") và xác nhận bằng URL
      else if (format === "image" && /\.(jpg|jpeg|png|gif)$/i.test(url)) {
        images.push(res.resourceURL);
      } else if (format === "video" && /\.(mp4|mov|avi)$/i.test(url)) {
        videos.push(res.resourceURL);
      }
    });

    return { images, videos };
  };

  const { images, videos } = processResources(resources);

  const player = useVideoPlayer(selectedVideoUrl || "", (player) => {
    player.loop = false;
    if (selectedVideoUrl) player.play();
  });

  const scrollToIndex = (index: number) => {
    if (flatListRef.current && images.length > 0) {
      const newIndex = Math.max(0, Math.min(index, images.length - 1));
      flatListRef.current.scrollToIndex({ index: newIndex, animated: true });
      setCurrentImageIndex(newIndex);
    }
  };

  const handlePrevious = () => scrollToIndex(currentImageIndex - 1);
  const handleNext = () => scrollToIndex(currentImageIndex + 1);

  const renderImageItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedImageUrl(item);
      }}
      activeOpacity={1}
    >
      <Image source={{ uri: item }} style={styles.modalImage} />
    </TouchableOpacity>
  );

  const renderVideoThumbnail = ({ item }: { item: string }) => (
    <VideoThumbnail videoUrl={item} onSelect={setSelectedVideoUrl} />
  );

  const closeFullscreen = () => {
    player.pause();
    setSelectedVideoUrl(null);
  };

  return (
    <>
      <Modal
        visible={visible && !selectedVideoUrl && !selectedImageUrl}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TextCustom style={styles.modalTitle}>Note Details</TextCustom>

            {/* Carousel cho ảnh */}
            {images.length > 0 ? (
              <View style={styles.carouselContainer}>
                <TouchableOpacity
                  style={[
                    styles.arrowButton,
                    currentImageIndex === 0 && styles.arrowButtonDisabled,
                  ]}
                  onPress={handlePrevious}
                  disabled={currentImageIndex === 0}
                >
                  <CustomIcon
                    name="chevron-left"
                    size={30}
                    color={
                      currentImageIndex === 0 ? "#ccc" : theme.colors.primary
                    }
                    type="MaterialCommunityIcons"
                  />
                </TouchableOpacity>

                <FlatList
                  ref={flatListRef}
                  data={images}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item, index) => `${index}`}
                  renderItem={renderImageItem}
                  onMomentumScrollEnd={(event) => {
                    const index = Math.round(
                      event.nativeEvent.contentOffset.x /
                        styles.modalImage.width
                    );
                    setCurrentImageIndex(index);
                  }}
                />

                <TouchableOpacity
                  style={[
                    styles.arrowButton,
                    currentImageIndex === images.length - 1 &&
                      styles.arrowButtonDisabled,
                  ]}
                  onPress={handleNext}
                  disabled={currentImageIndex === images.length - 1}
                >
                  <CustomIcon
                    name="chevron-right"
                    size={30}
                    color={
                      currentImageIndex === images.length - 1
                        ? "#ccc"
                        : theme.colors.primary
                    }
                    type="MaterialCommunityIcons"
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <TextCustom style={styles.noMediaText}>
                No images available
              </TextCustom>
            )}

            {/* Video section */}
            <View style={styles.videoSection}>
              <TextCustom style={styles.sectionTitle}>Videos</TextCustom>
              {videos.length > 0 ? (
                <FlatList
                  data={videos}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item, index) => `${index}`}
                  renderItem={renderVideoThumbnail}
                  contentContainerStyle={styles.videoList}
                />
              ) : (
                <TextCustom style={styles.noMediaText}>
                  No videos available
                </TextCustom>
              )}
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <TextCustom style={styles.closeButtonText}>Close</TextCustom>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {selectedImageUrl !== null && (
        <Modal
          visible={!!selectedImageUrl}
          transparent={false}
          animationType="fade"
          onRequestClose={() => setSelectedImageUrl(null)}
        >
          <View style={styles.fullscreenContainer}>
            <Image
              source={{ uri: selectedImageUrl }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
            <TouchableOpacity
              style={styles.fullscreenCloseButton}
              onPress={() => setSelectedImageUrl(null)}
            >
              <CustomIcon
                name="close"
                size={30}
                color="#fff"
                type="MaterialCommunityIcons"
              />
            </TouchableOpacity>
          </View>
        </Modal>
      )}

      {/* Fullscreen cho video */}
      {selectedVideoUrl && (
        <Modal
          visible={!!selectedVideoUrl}
          transparent={false}
          animationType="fade"
          onRequestClose={closeFullscreen}
        >
          <View style={styles.fullscreenContainer}>
            <VideoView
              player={player}
              style={styles.fullscreenVideo}
              allowsFullscreen
              allowsPictureInPicture
              nativeControls
            />
            <TouchableOpacity
              style={styles.fullscreenCloseButton}
              onPress={closeFullscreen}
            >
              <CustomIcon
                name="close"
                size={30}
                color="#fff"
                type="MaterialCommunityIcons"
              />
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.primary,
    marginBottom: 15,
  },
  carouselContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  modalImage: {
    width: 250,
    height: 250,
    borderRadius: 8,
  },
  arrowButton: {
    padding: 10,
  },
  arrowButtonDisabled: {
    opacity: 0.5,
  },
  videoSection: {
    width: "100%",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.primary,
    marginBottom: 10,
  },
  videoList: {
    paddingVertical: 5,
  },
  thumbnailContainer: {
    position: "relative",
    marginRight: 10,
  },
  videoThumbnail: {
    width: 100,
    height: 60,
    borderRadius: 8,
  },
  noMediaText: {
    color: "#999",
    fontSize: 14,
    fontStyle: "italic",
  },
  closeButton: {
    backgroundColor: "#BCD379",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  closeButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: "500",
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenVideo: {
    width: "100%",
    height: "100%",
  },
  fullscreenImage: {
    flex: 1,
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  fullscreenCloseButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    padding: 5,
  },
});

export default NoteDetailModal;
