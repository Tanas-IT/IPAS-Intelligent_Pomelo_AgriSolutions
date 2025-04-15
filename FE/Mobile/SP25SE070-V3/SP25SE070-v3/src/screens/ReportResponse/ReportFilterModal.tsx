import React, { useState } from "react";
import {
    View,
    Modal,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Animated,
    Easing,
    Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { TextCustom, CustomIcon } from "@/components";
import theme from "@/theme";

const { width } = Dimensions.get("window");

interface ReportFilterModalProps {
    visible: boolean;
    filters: {
        direction?: "asc" | "desc";
        isTrainned?: boolean;
        isUnanswered?: boolean;
    };
    onApply: (filters: ReportFilterModalProps["filters"]) => void;
    onClose: () => void;
}

const ReportFilterModal: React.FC<ReportFilterModalProps> = ({
    visible,
    filters: initialFilters,
    onApply,
    onClose,
}) => {
    const [direction, setDirection] = useState<"asc" | "desc" | undefined>(
        initialFilters.direction
    );
    const [isTrainned, setIsTrainned] = useState<boolean | undefined>(
        initialFilters.isTrainned
    );
    const [isUnanswered, setIsUnanswered] = useState<boolean | undefined>(
        initialFilters.isUnanswered
    );

    const translateY = React.useRef(new Animated.Value(300)).current;

    React.useEffect(() => {
        if (visible) {
            Animated.timing(translateY, {
                toValue: 0,
                duration: 400,
                easing: Easing.out(Easing.back(1.2)),
                useNativeDriver: true,
            }).start();
        } else {
            translateY.setValue(300);
        }
    }, [visible]);

    const handleApply = () => {
        Animated.timing(translateY, {
            toValue: 300,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            onApply({ direction, isTrainned, isUnanswered });
            onClose();
        });
    };

    const renderRadio = (
        label: string,
        value: any,
        selectedValue: any,
        onSelect: (value: any) => void,
        iconName?: string
    ) => (
        <TouchableOpacity
            style={[
                styles.radioButton,
                selectedValue === value && styles.radioButtonSelected,
            ]}
            onPress={() => onSelect(value)}
            activeOpacity={0.7}
        >
            {iconName && (
                <CustomIcon
                    name={iconName}
                    size={20}
                    color={theme.colors.primary}
                    type="MaterialCommunityIcons"
                />
            )}
            <TextCustom
                style={[
                    styles.radioText,
                    selectedValue === value && styles.radioTextSelected,
                ]}
            >
                {label}
            </TextCustom>
            {selectedValue === value && (
                <View style={styles.radioCheck}>
                    <CustomIcon
                        name="check"
                        size={16}
                        color="#FFF"
                        type="MaterialCommunityIcons"
                    />
                </View>
            )}
        </TouchableOpacity>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={onClose}
                />
                <Animated.View
                    style={[
                        styles.modalContainer,
                        { transform: [{ translateY }] },
                    ]}
                >
                    <LinearGradient
                        colors={["#20461e", "#bcd379"]}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={styles.modalHeader}
                    >
                        <View style={styles.headerContent}>
                            <TextCustom style={styles.modalTitle}>FILTER</TextCustom>
                            <TextCustom style={styles.modalSubtitle}>
                                Adjust to display report
                            </TextCustom>
                        </View>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={onClose}
                            activeOpacity={0.8}
                        >
                            <CustomIcon
                                name="close"
                                size={24}
                                color="#FFF"
                                type="MaterialCommunityIcons"
                            />
                        </TouchableOpacity>
                    </LinearGradient>

                    <ScrollView
                        contentContainerStyle={styles.modalBody}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Sort Direction */}
                        <View style={styles.filterSection}>
                            <View style={styles.sectionHeader}>
                                <CustomIcon
                                    name="sort"
                                    size={20}
                                    color={theme.colors.primary}
                                    type="MaterialCommunityIcons"
                                />
                                <TextCustom style={styles.sectionTitle}>
                                    Direction
                                </TextCustom>
                            </View>
                            <View style={styles.radioGroup}>
                                {renderRadio(
                                    "Ascending",
                                    "asc",
                                    direction,
                                    setDirection,
                                    "sort-ascending"
                                )}
                                {renderRadio(
                                    "Descending",
                                    "desc",
                                    direction,
                                    setDirection,
                                    "sort-descending"
                                )}
                            </View>
                        </View>

                        {/* AI Trained Filter */}
                        <View style={styles.filterSection}>
                            <View style={styles.sectionHeader}>
                                <CustomIcon
                                    name="robot"
                                    size={20}
                                    color={theme.colors.primary}
                                    type="MaterialCommunityIcons"
                                />
                                <TextCustom style={styles.sectionTitle}>
                                    Trained Status
                                </TextCustom>
                            </View>
                            <View style={styles.radioGroup}>
                                {renderRadio(
                                    "All",
                                    undefined,
                                    isTrainned,
                                    setIsTrainned,
                                    "filter-variant"
                                )}
                                {renderRadio(
                                    "Trained",
                                    true,
                                    isTrainned,
                                    setIsTrainned,
                                    "check-circle"
                                )}
                                {renderRadio(
                                    "Un-Trained",
                                    false,
                                    isTrainned,
                                    setIsTrainned,
                                    "close-circle"
                                )}
                            </View>
                        </View>

                        {/* Answer Status Filter */}
                        <View style={styles.filterSection}>
                            <View style={styles.sectionHeader}>
                                <CustomIcon
                                    name="message-reply"
                                    size={20}
                                    color={theme.colors.primary}
                                    type="MaterialCommunityIcons"
                                />
                                <TextCustom style={styles.sectionTitle}>
                                    Answer status
                                </TextCustom>
                            </View>
                            <View style={styles.radioGroup}>
                                {renderRadio(
                                    "All",
                                    undefined,
                                    isUnanswered,
                                    setIsUnanswered,
                                    "filter-variant"
                                )}
                                {renderRadio(
                                    "Un-Answered",
                                    true,
                                    isUnanswered,
                                    setIsUnanswered,
                                    "alert-circle"
                                )}
                                {renderRadio(
                                    "Answered",
                                    false,
                                    isUnanswered,
                                    setIsUnanswered,
                                    "check-circle"
                                )}
                            </View>
                        </View>
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={styles.resetButton}
                            onPress={() => {
                                setDirection(undefined);
                                setIsTrainned(undefined);
                                setIsUnanswered(undefined);
                            }}
                        >
                            <TextCustom style={styles.resetText}>Reset</TextCustom>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.applyButton}
                            onPress={handleApply}
                            activeOpacity={0.8}
                        >
                            <View style={styles.gradient}
                            >
                                <TextCustom style={styles.applyButtonText}>
                                    APPLY
                                </TextCustom>
                                <CustomIcon
                                    name="filter-check"
                                    size={20}
                                    color="#20461e"
                                    type="MaterialCommunityIcons"
                                />
                            </View>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "flex-end",
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    modalContainer: {
        width: "100%",
        maxHeight: "85%",
        backgroundColor: "#FFF",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    modalHeader: {
        paddingVertical: 24,
        paddingHorizontal: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    headerContent: {
        flex: 1,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#FFF",
        letterSpacing: 1,
        marginBottom: 4,
    },
    modalSubtitle: {
        fontSize: 14,
        color: "rgba(255,255,255,0.8)",
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalBody: {
        padding: 20,
        paddingBottom: 16,
    },
    filterSection: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#333",
        marginLeft: 8,
    },
    radioGroup: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    radioButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: "#EEE",
        backgroundColor: "#FAFAFA",
        minWidth: width * 0.4,
        flex: 1,
    },
    radioButtonSelected: {
        backgroundColor: theme.colors.secondary,
        borderColor: theme.colors.secondary,
    },
    radioIcon: {
        marginRight: 8,
    },
    radioText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#555",
        flex: 1,
    },
    radioTextSelected: {
        color: theme.colors.primary,
    },
    radioCheck: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: "rgba(255,255,255,0.3)",
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 8,
    },
    footer: {
        flexDirection: "row",
        borderTopWidth: 1,
        borderTopColor: "#EEE",
        padding: 16,
    },
    resetButton: {
        flex: 1,
        padding: 16,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    resetText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FF5252",
    },
    applyButton: {
        flex: 2,
        borderRadius: 12,
        overflow: "hidden",
    },
    gradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        backgroundColor: '#fee69c'
    },
    applyButtonText: {
        fontSize: 16,
        fontWeight: "800",
        color: "#20461e",
        marginRight: 8,
        letterSpacing: 0.5,
    },
});

export default ReportFilterModal;