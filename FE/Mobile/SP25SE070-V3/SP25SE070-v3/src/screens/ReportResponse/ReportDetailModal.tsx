import React, { useRef } from 'react';
import {
    View,
    Modal,
    TouchableOpacity,
    ScrollView,
    Image,
    StyleSheet,
    Animated,
    Dimensions,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ReportResponse } from '@/types/report';
import { TextCustom, CustomIcon } from '@/components';
import theme from '@/theme';

const { width, height } = Dimensions.get('window');

interface ReportDetailModalProps {
    visible: boolean;
    report: ReportResponse | null;
    onClose: () => void;
}

const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
    visible,
    report,
    onClose,
}) => {
    const scrollY = useRef(new Animated.Value(0)).current;
    const headerHeight = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [200, 100],
        extrapolate: 'clamp',
    });

    if (!report) return null;

    const getStatusFromReport = (report: ReportResponse): 'Pending' | 'Answered' => {
        if (!report.answerFromExpert || report.answerFromExpert.trim() === '') {
            return 'Pending';
        }
        return 'Answered';
    };


    const statusConfig = {
        Pending: { color: '#FFA726', icon: 'clock-alert' },
        Answered: { color: '#4CAF50', icon: 'check-circle' },
        Closed: { color: '#9E9E9E', icon: 'lock' },
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {/* Animated Header */}
                <Animated.View style={[styles.header, { height: headerHeight }]}>
                    <LinearGradient
                        colors={["#20461e", "#bcd379"]}
                        style={styles.gradient}
                        locations={[0, 0.7, 1]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <View style={styles.headerContent}>
                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={onClose}
                                activeOpacity={0.8}
                            >
                                <CustomIcon
                                    name="close"
                                    size={28}
                                    color="white"
                                    type="MaterialCommunityIcons"
                                />
                            </TouchableOpacity>

                            <View style={styles.titleContainer}>
                                <TextCustom style={styles.reportCode}>
                                    #{report.reportCode}
                                </TextCustom>
                                <View style={[
                                    styles.statusBadge,
                                    { backgroundColor: statusConfig[getStatusFromReport(report)].color }
                                ]}>
                                    <CustomIcon
                                        name={statusConfig[getStatusFromReport(report)]?.icon || 'help-circle'}
                                        size={16}
                                        color="white"
                                        type="MaterialCommunityIcons"
                                    />
                                    <TextCustom style={styles.statusText}>
                                        {report.status}
                                    </TextCustom>
                                </View>
                            </View>
                        </View>
                    </LinearGradient>
                </Animated.View>

                {/* Scrollable Content */}
                <Animated.ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.contentContainer}
                    scrollEventThrottle={16}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: false }
                    )}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.mainContent}>
                        <View style={styles.userInfo}>
                            <View style={styles.avatar}>
                                <CustomIcon
                                    name="account-circle"
                                    size={48}
                                    color={theme.colors.white}
                                    type="MaterialCommunityIcons"
                                />
                            </View>
                            <View style={styles.userDetails}>
                                <TextCustom style={styles.userName}>
                                    {report.questionerName}
                                </TextCustom>
                                <TextCustom style={styles.date}>
                                    {new Date(report.createdDate).toLocaleString('vi-VN', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </TextCustom>
                            </View>
                        </View>

                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <CustomIcon
                                    name="help-circle"
                                    size={24}
                                    color="#FF7043"
                                    type="MaterialCommunityIcons"
                                />
                                <TextCustom style={styles.cardTitle}>Question</TextCustom>
                            </View>
                            <TextCustom style={styles.cardText}>
                                {report.questionOfUser || 'No question'}
                            </TextCustom>
                        </View>

                        {report.description && (
                            <View style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <CustomIcon
                                        name="text-box"
                                        size={24}
                                        color="#5C6BC0"
                                        type="MaterialCommunityIcons"
                                    />
                                    <TextCustom style={styles.cardTitle}>Description</TextCustom>
                                </View>
                                <TextCustom style={styles.cardText}>
                                    {report.description}
                                </TextCustom>
                            </View>
                        )}

                        <View style={[
                            styles.card,
                            !report.answerFromExpert && styles.pendingCard
                        ]}>
                            <View style={styles.cardHeader}>
                                <CustomIcon
                                    name={report.answerFromExpert ? "comment-check" : "comment-alert"}
                                    size={24}
                                    color={report.answerFromExpert ? "#66BB6A" : "#FF7043"}
                                    type="MaterialCommunityIcons"
                                />
                                <TextCustom style={styles.cardTitle}>Answer</TextCustom>
                            </View>
                            <TextCustom style={styles.cardText}>
                                {report.answerFromExpert || 'Not answered yet'}
                            </TextCustom>
                            {report.answerFromExpert && report.answererName && (
                                <View style={styles.expertInfo}>
                                    <TextCustom style={styles.expertName}>
                                        {report.answererName}
                                    </TextCustom>
                                    <TextCustom style={styles.expertLabel}>Expert</TextCustom>
                                </View>
                            )}
                        </View>

                        {report.imageURL && (
                            <View style={styles.imageSection}>
                                <TextCustom style={styles.sectionTitle}>Attachment Image</TextCustom>
                                <Image
                                    source={{ uri: report.imageURL }}
                                    style={styles.image}
                                    resizeMode="cover"
                                />
                            </View>
                        )}
                    </View>
                </Animated.ScrollView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        width: '100%',
        overflow: 'hidden',
        zIndex: 2,
    },
    gradient: {
        flex: 1,
    },
    headerImage: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.3,
    },
    headerContent: {
        flex: 1,
        padding: 24,
        paddingTop: Platform.OS === 'ios' ? 50 : 24,
        justifyContent: 'flex-end',
    },
    closeButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 24,
        right: 24,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
        padding: 8,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    reportCode: {
        fontSize: 28,
        fontWeight: '800',
        color: 'white',
        letterSpacing: 1,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
        marginLeft: 6,
        textTransform: 'uppercase',
    },
    scrollView: {
        flex: 1,
        marginTop: -24,
        zIndex: 1,
    },
    contentContainer: {
        paddingBottom: 50,
    },
    mainContent: {
        backgroundColor: '#F5F5F5',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingTop: 32,
        minHeight: height - 100,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    avatar: {
        marginRight: 16,
    },
    userDetails: {
        flex: 1,
    },
    userName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    date: {
        fontSize: 14,
        color: '#777',
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.primary,
    },
    pendingCard: {
        borderLeftColor: '#FFA726',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        marginLeft: 10,
    },
    cardText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#555',
    },
    expertInfo: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#EEE',
        flexDirection: 'row',
        alignItems: 'center',
    },
    expertName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#5C6BC0',
        marginRight: 8,
    },
    expertLabel: {
        fontSize: 12,
        color: '#888',
        backgroundColor: '#EEE',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 10,
    },
    imageSection: {
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 12,
    },
});

export default ReportDetailModal;