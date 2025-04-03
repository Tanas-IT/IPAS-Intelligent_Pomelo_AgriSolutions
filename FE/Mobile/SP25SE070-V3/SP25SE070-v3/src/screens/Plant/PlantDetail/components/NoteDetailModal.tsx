import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import CustomIcon from 'components/CustomIcon';
import { PlantGrowthHistory } from '@/types/plant';
import { useVideoPlayer, VideoView } from 'expo-video';
import TextCustom from 'components/TextCustom';
import theme from '@/theme';

interface ExtendedPlantGrowthHistory extends PlantGrowthHistory {
  images?: string[];
  videos?: string[];
}

interface NoteDetailModalProps {
  visible: boolean;
  history: ExtendedPlantGrowthHistory | null;
  onClose: () => void;
}

const VideoThumbnail: React.FC<{ videoUrl: string; onSelect: (url: string) => void }> = ({
    videoUrl,
    onSelect,
  }) => {
    const player = useVideoPlayer(videoUrl, (player) => {
      player.loop = false;
      player.muted = true;
    });
  
    return (
      <TouchableOpacity onPress={() => onSelect(videoUrl)} style={styles.thumbnailContainer}>
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

const NoteDetailModal: React.FC<NoteDetailModalProps> = ({ visible, history, onClose }) => {
  const flatListRef = useRef<FlatList>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);

  const processResources = (resources?: string[]) => {
    if (!resources) return { images: [], videos: [] };
    const images = resources.filter((url) => /\.(jpg|jpeg|png|gif)$/i.test(url));
    const videos = resources.filter((url) => /\.(mp4|mov|avi)$/i.test(url));
    return { images, videos };
  };

  const { images, videos } = processResources(history?.plantResources);

  const player = useVideoPlayer(selectedVideoUrl || '', (player) => {
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
    <Image source={{ uri: item }} style={styles.modalImage} />
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
        visible={visible && !selectedVideoUrl}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <TouchableOpacity style={styles.modalOverlay} onPress={onClose}>
          <View style={styles.modalContent}>
            <TextCustom style={styles.modalTitle}>Note Details</TextCustom>

            {/* Carousel */}
            {images.length > 0 ? (
              <View style={styles.carouselContainer}>
                <TouchableOpacity
                  style={[styles.arrowButton, currentImageIndex === 0 && styles.arrowButtonDisabled]}
                  onPress={handlePrevious}
                  disabled={currentImageIndex === 0}
                >
                  <CustomIcon
                    name="chevron-left"
                    size={30}
                    color={currentImageIndex === 0 ? '#ccc' : theme.colors.primary}
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
                      event.nativeEvent.contentOffset.x / styles.modalImage.width
                    );
                    setCurrentImageIndex(index);
                  }}
                />

                <TouchableOpacity
                  style={[
                    styles.arrowButton,
                    currentImageIndex === images.length - 1 && styles.arrowButtonDisabled,
                  ]}
                  onPress={handleNext}
                  disabled={currentImageIndex === images.length - 1}
                >
                  <CustomIcon
                    name="chevron-right"
                    size={30}
                    color={currentImageIndex === images.length - 1 ? '#ccc' : theme.colors.primary}
                    type="MaterialCommunityIcons"
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <TextCustom style={styles.noMediaText}>No images available</TextCustom>
            )}

            {/* Video section */}
            <View style={styles.videoSection}>
              <TextCustom style={styles.sectionTitle}>Videoss</TextCustom>
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
                <TextCustom style={styles.noMediaText}>No videos available</TextCustom>
              )}
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <TextCustom style={styles.closeButtonText}>Close</TextCustom>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

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
            <TouchableOpacity style={styles.fullscreenCloseButton} onPress={closeFullscreen}>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: 15,
  },
  carouselContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    width: '100%',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.primary,
    marginBottom: 10,
  },
  videoList: {
    paddingVertical: 5,
  },
  thumbnailContainer: {
    position: 'relative',
    marginRight: 10,
  },
  videoThumbnail: {
    width: 100,
    height: 60,
    borderRadius: 8,
  },
  playIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -15 }, { translateY: -15 }],
  },
  noMediaText: {
    color: '#999',
    fontSize: 14,
    fontStyle: 'italic',
  },
  closeButton: {
    backgroundColor: '#BCD379',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  closeButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenVideo: {
    width: '100%',
    height: '100%',
  },
  fullscreenCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 5,
  },
  video: {
    width: 150,
    height: 100,
    borderRadius: 8,
    marginRight: 10,
  },
});

export default NoteDetailModal;