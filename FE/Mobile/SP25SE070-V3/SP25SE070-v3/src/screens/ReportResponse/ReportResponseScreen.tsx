import React, { useState, useEffect, useRef } from "react";
import {
    View,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Modal,
    ActivityIndicator,
    Animated,
    Dimensions,
    ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Toast from "react-native-toast-message";
import { ReportResponse } from "@/types/report";
import { TextCustom, CustomIcon } from "@/components";
import theme from "@/theme";
import { Picker } from "@react-native-picker/picker";
import { useAuthStore } from "@/store";
import { reportService } from "@/services";
import ReportDetailModal from "./ReportDetailModal";
import ReportFilterModal from "./ReportFilterModal";

const { width } = Dimensions.get("window");

const ReportResponseScreen = () => {
    const { userId } = useAuthStore();
    const [reports, setReports] = useState<ReportResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<ReportResponse | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [filters, setFilters] = useState<{
        search?: string;
        direction?: "asc" | "desc";
        isTrainned?: boolean;
        isUnanswered?: boolean;
    }>({ search: "", direction: "desc" });

    // Animation values
    const scrollY = useRef(new Animated.Value(0)).current;
    const headerHeight = scrollY.interpolate({
        inputRange: [0, 100],
        outputRange: [180, 80],
        extrapolate: "clamp",
    });

    useEffect(() => {
        fetchReports();
    }, [userId, filters]);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const response = await reportService.getReportsOfUser({
                userId: Number(userId),
                search: filters.search || undefined,
                direction: filters.direction,
                isTrainned: filters.isTrainned,
                isUnanswered: filters.isUnanswered,
            });
            setReports(response.data);
        } catch (error) {
            Toast.show({
                type: "error",
                text1: "Lỗi",
                text2: "Không tải được danh sách báo cáo",
            });
        } finally {
            setLoading(false);
        }
    };

    const openModal = (report: ReportResponse) => {
        setSelectedReport(report);
        setModalVisible(true);
    };
    const handleApplyFilters = (newFilters: typeof filters) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
    };

    const renderReport = ({ item, index }: { item: ReportResponse; index: number }) => {
        const translateY = scrollY.interpolate({
            inputRange: [0, 100],
            outputRange: [0, -50],
            extrapolate: "clamp",
        });

        return (
            <Animated.View
                style={{
                    opacity: scrollY.interpolate({
                        inputRange: [0, 100],
                        outputRange: [1, 0.8],
                        extrapolate: "clamp",
                    }),
                    transform: [{ translateY }],
                }}
            >
                <TouchableOpacity
                    style={[
                        styles.card,
                        {
                            borderLeftWidth: 5,
                            borderLeftColor: item.answerFromExpert ? "#4CAF50" : "#FF5252",
                        },
                    ]}
                    onPress={() => openModal(item)}
                    activeOpacity={0.8}
                >
                    <View style={styles.cardHeader}>
                        <View style={styles.reportCodeContainer}>
                            <TextCustom style={styles.reportCode}>#{item.reportCode}</TextCustom>
                            <CustomIcon
                                name={item.answerFromExpert ? "check-circle" : "alert-circle"}
                                size={20}
                                color={item.answerFromExpert ? "#4CAF50" : "#FF5252"}
                                type="MaterialCommunityIcons"
                            />
                        </View>
                        <TextCustom style={styles.date}>
                            {new Date(item.createdDate).toLocaleString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                            })}
                        </TextCustom>
                    </View>

                    <TextCustom style={styles.question} numberOfLines={2}>
                        {item.questionOfUser || "No question"}
                    </TextCustom>

                    {item.answerFromExpert && (
                        <View style={styles.answerContainer}>
                            <TextCustom style={styles.answerLabel}>Answer:</TextCustom>
                            <TextCustom style={styles.answerText} numberOfLines={2}>
                                {item.answerFromExpert}
                            </TextCustom>
                        </View>
                    )}

                    <View style={styles.footer}>
                        <View style={styles.userInfo}>
                            <CustomIcon
                                name="account-circle"
                                size={16}
                                color="#666"
                                type="MaterialCommunityIcons"
                            />
                            <TextCustom style={styles.userName}>{item.questionerName}</TextCustom>
                        </View>
                        {item.answererName && (
                            <View style={styles.userInfo}>
                                <CustomIcon
                                    name="account-tie"
                                    size={16}
                                    color="#666"
                                    type="MaterialCommunityIcons"
                                />
                                <TextCustom style={styles.userName}>{item.answererName}</TextCustom>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Animated Header */}
            <Animated.View style={[styles.header, { height: headerHeight }]}>
                <LinearGradient
                    // colors={['#A8DF8E', '#72BA7A', '#407A57']}
                    colors={['#bcd379', '#407A57', '#bcd379']}
                    locations={[0, 0.5, 1]}
                    style={styles.gradient}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                >
                    <View style={styles.headerContent}>
                        <TextCustom style={styles.headerTitle}>Your Report</TextCustom>

                        <View style={styles.searchContainer}>
                            <CustomIcon
                                name="magnify"
                                size={20}
                                color="#FFF"
                                type="MaterialCommunityIcons"
                            />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search report..."
                                placeholderTextColor="rgba(255,255,255,0.7)"
                                value={filters.search}
                                onChangeText={(text) => setFilters((prev) => ({ ...prev, search: text }))}
                            />
                            <TouchableOpacity
                                style={styles.filterButton}
                                onPress={() => setFilterModalVisible(true)}
                            >
                                <CustomIcon
                                    name="filter-variant"
                                    size={20}
                                    color="#FFF"
                                    type="MaterialCommunityIcons"
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </LinearGradient>
            </Animated.View>

            {/* Content */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                </View>
            ) : (
                <Animated.FlatList
                    data={reports}
                    renderItem={renderReport}
                    keyExtractor={(item) => item.reportID.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <CustomIcon
                                name="file-document-outline"
                                size={48}
                                color="#CCC"
                                type="MaterialCommunityIcons"
                            />
                            <TextCustom style={styles.emptyText}>No Data</TextCustom>
                        </View>
                    }
                    scrollEventThrottle={16}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: false }
                    )}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Modals */}
            <ReportDetailModal
                visible={modalVisible}
                report={selectedReport}
                onClose={() => setModalVisible(false)}
            />

            <ReportFilterModal
                visible={filterModalVisible}
                filters={filters}
                onApply={handleApplyFilters}
                onClose={() => setFilterModalVisible(false)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F7FA",
    },
    header: {
        width: "100%",
        overflow: "hidden",
        zIndex: 2,
    },
    gradient: {
        flex: 1,
        paddingTop: 50,
    },
    headerContent: {
        paddingHorizontal: 24,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: "800",
        color: "#FFF",
        marginBottom: 20,
        textShadowColor: "rgba(0,0,0,0.2)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
        textAlign: 'center'
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.2)",
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: "#FFF",
        paddingVertical: 4,
    },
    filterButton: {
        padding: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    listContent: {
        padding: 16,
        paddingTop: 50,
    },
    card: {
        backgroundColor: "#FFF",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    reportCodeContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    reportCode: {
        fontSize: 16,
        fontWeight: "700",
        color: "#333",
        marginRight: 8,
    },
    date: {
        fontSize: 12,
        color: "#888",
    },
    question: {
        fontSize: 15,
        color: "#444",
        lineHeight: 22,
        marginBottom: 12,
    },
    answerContainer: {
        backgroundColor: "rgba(76, 175, 80, 0.1)",
        borderRadius: 8,
        padding: 10,
        marginBottom: 12,
    },
    answerLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#4CAF50",
        marginBottom: 4,
    },
    answerText: {
        fontSize: 14,
        color: "#333",
        lineHeight: 20,
    },
    footer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 8,
    },
    userInfo: {
        flexDirection: "row",
        alignItems: "center",
    },
    userName: {
        fontSize: 12,
        color: "#666",
        marginLeft: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
    },
    emptyText: {
        fontSize: 16,
        color: "#999",
        marginTop: 16,
        textAlign: "center",
    },
});

export default ReportResponseScreen;