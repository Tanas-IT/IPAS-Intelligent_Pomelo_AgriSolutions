import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
} from 'react-native';
import { PlantDetailData, PlantGrowthHistory } from '@/types/plant';
import CustomIcon from 'components/CustomIcon';
import { avt } from 'assets/images';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '@/navigation/Types';
import NoteDetailModal from '../NoteDetailModal';
import { ROUTE_NAMES } from '@/navigation/RouteNames';

const currentUser = 'John Doe';

const GrowthHistoryTab: React.FC<{ plant: PlantDetailData }> = ({ plant }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedHistory, setSelectedHistory] = useState<PlantGrowthHistory | null>(null);
    const navigation = useNavigation<RootStackNavigationProp>();

    const handleDelete = (historyId: number) => {
        Toast.show({
            type: 'success',
            text1: 'Note Deleted',
            text2: 'The note has been successfully deleted.',
        });
    };

    const processResources = (resources?: string[]) => {
        if (!resources) return { images: [], videos: [] };
        const images = resources.filter((url) =>
            /\.(jpg|jpeg|png|gif)$/i.test(url)
        );
        const videos = resources.filter((url) =>
            /\.(mp4|mov|avi)$/i.test(url)
        );
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
                onPress={() => navigation.navigate(ROUTE_NAMES.PLANT.ADD_NOTE, { plantId: plant.plantId })}
            >
                <CustomIcon name="plus" size={24} color="#064944" type="MaterialCommunityIcons" />
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.content}>
                {plant.growthHistory.length > 0 ? (
                    plant.growthHistory.map((history, index) => (
                        <View key={history.plantGrowthHistoryId} style={styles.timelineItem}>
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
                                        <View style={{ flexDirection: 'column' }}>
                                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                                <Text style={styles.timelineAuthor}>{history.noteTaker}</Text>
                                                <Text style={styles.createText}>created this note</Text>
                                            </View>
                                            <Text style={styles.timelineDate}>
                                                {new Date(history.createDate).toLocaleDateString()}
                                            </Text>
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
                                                onPress={() => handleDelete(history.plantGrowthHistoryId)}
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
                                            <Text style={styles.timelineText}>Issues:</Text>
                                            <Text style={styles.issueText}>{history.issueName}</Text>
                                        </View>
                                    )}

                                    {history.content && (
                                        <View>
                                            <Text style={styles.timelineText}>Notes:</Text>
                                            <Text style={styles.issueText}>{history.content}</Text>
                                        </View>
                                    )}

                                    {/* nếu có hình ảnh -> nút detail */}
                                    {history.plantResources && history.plantResources.length > 0 && (
                                        <TouchableOpacity
                                            style={styles.detailButton}
                                            onPress={() => showDetailModal(history)}
                                        >
                                            <Text style={styles.detailButtonText}>View Details</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        </View>
                    ))
                ) : (
                    <View style={styles.emptyContainer}>
                        <CustomIcon name="text" size={40} color="#ccc" type="MaterialCommunityIcons" />
                        <Text style={styles.emptyText}>No growth history recorded yet</Text>
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fffcee',
    },
    content: {
        padding: 15,
        paddingBottom: 30,
        marginTop: 40,
    },
    timelineItem: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    timelineLeft: {
        width: 40,
        alignItems: 'center',
    },
    timelineDot: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#064944',
        borderWidth: 3,
        borderColor: '#E8F5E9',
    },
    timelineLine: {
        flex: 1,
        width: 2,
        backgroundColor: '#ddd',
        marginVertical: 5,
    },
    timelineContent: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    timelineHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    timelineDateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    timelineDate: {
        fontSize: 12,
        color: '#A5A5A5',
    },
    timelineAuthor: {
        fontSize: 14,
        color: '#064944',
        fontWeight: '600',
    },
    createText: {
        color: 'black',
        fontWeight: '500',
        fontSize: 14,
    },
    timelineNote: {
        flexDirection: 'column',
        gap: 10,
    },
    timelineText: {
        fontSize: 14,
        fontWeight: '500',
    },
    issueText: {
        fontSize: 14,
        fontWeight: '300',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyText: {
        marginTop: 15,
        color: '#999',
        fontSize: 16,
    },
    avatar: {
        width: 26,
        height: 26,
        borderRadius: 28,
    },
    addButton: {
        position: 'absolute',
        top: 10,
        right: 20,
        backgroundColor: '#BCD379',
        width: 36,
        height: 36,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        zIndex: 10,
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailButton: {
        backgroundColor: '#BCD379',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        alignSelf: 'flex-start',
        marginTop: 10,
    },
    detailButtonText: {
        color: '064944',
        fontSize: 14,
        fontWeight: '500',
    },
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
        color: '#064944',
        marginBottom: 15,
    },
    modalImage: {
        width: 200,
        height: 200,
        borderRadius: 8,
        marginRight: 10,
    },
    closeButton: {
        backgroundColor: '#BCD379',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 6,
        marginTop: 15,
    },
    closeButtonText: {
        color: '#064944',
        fontSize: 16,
        fontWeight: '500',
    },
});

export default GrowthHistoryTab;