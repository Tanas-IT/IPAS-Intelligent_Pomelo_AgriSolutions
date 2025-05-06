import React, { useEffect, useState } from "react";
import { View, Image, TouchableOpacity, ScrollView } from "react-native";
import { formatDate, getRoleId, getUserId } from "@/utils/UtilFunction";
import { Badge, BadgeText } from "@gluestack-ui/themed";
import { styles } from "./FarmPickerScreen.styles";
import { Loading, TextCustom } from "@/components";
import { useAuthStore } from "@/store";
import { GetFarmPicker } from "@/payloads";
import { AuthService, FarmService } from "@/services";
import { AuthNavigationProp, ROUTE_NAMES, UserRolesStr } from "@/constants";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import theme from "@/theme";

const roleColorMap = {
  [UserRolesStr.Owner]: theme.colors.color_bg_tag_owner,
  [UserRolesStr.Manager]: theme.colors.color_bg_tag_other,
  [UserRolesStr.Employee]: theme.colors.color_bg_tag_other,
};

const FarmPickerScreen = () => {
  const [farmsData, setFarmsData] = useState<GetFarmPicker[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { userId } = useAuthStore();
  const navigation = useNavigation<AuthNavigationProp>();

  useEffect(() => {
    const fetchFarms = async () => {
      if (!userId) return;
      try {
        setLoading(true);
        const result = await FarmService.getFarmsOfUser(userId);
        if (result.statusCode === 200) {
          setFarmsData(result.data ?? []);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFarms();
  }, []);

  const handleCardClick = async (farmId: number) => {
    const res = await AuthService.refreshTokenInFarm(farmId);
    if (res.statusCode === 200) {
      const roleId = getRoleId(res.data.accessToken);
      const userId = getUserId(res.data.accessToken);
      useAuthStore.getState().updateRoleInFarm(res.data, userId, roleId);
      switch (roleId) {
        case UserRolesStr.Owner:
          navigation.navigate(ROUTE_NAMES.MAIN.DRAWER, {
            screen: ROUTE_NAMES.MAIN.MAIN_TABS,
          });
          break;
        case UserRolesStr.Manager:
          navigation.navigate(ROUTE_NAMES.MAIN.DRAWER, {
            screen: ROUTE_NAMES.MAIN.MAIN_TABS,
          });
          break;
        case UserRolesStr.Employee:
          navigation.navigate(ROUTE_NAMES.MAIN.DRAWER, {
            screen: ROUTE_NAMES.MAIN.MAIN_TABS,
          });
          break;
        default:
          Toast.show({
            type: "error",
            text1: "Unauthorized access.",
          });
          break;
      }
    }
  };

  if (loading) return <Loading />;

  return (
    <View style={styles.container}>
      <TextCustom style={styles.headerTitle}>Select Your Farm</TextCustom>
      {farmsData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <TextCustom style={styles.emptyText}>
            You have not been assigned to any farms yet.
          </TextCustom>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {farmsData.map((farm) => {
            const isInactive =
              farm.farm.status.toLowerCase() === "inactive" || !farm.isActive;

            return (
              <View key={farm.farm.farmId} style={styles.cardContainer}>
                {/* Farm Image */}
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: farm.farm.logoUrl }}
                    style={styles.farmImage}
                    resizeMode="cover"
                  />
                </View>

                {/* Farm Card */}
                <View style={[styles.card, isInactive && styles.inactiveCard]}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() =>
                      !isInactive && handleCardClick(farm.farm.farmId)
                    }
                  >
                    <View style={styles.cardContent}>
                      <TextCustom style={styles.farmName}>
                        {farm.farm.farmName}
                      </TextCustom>

                      <View style={styles.addressContainer}>
                        <TextCustom style={styles.addressText}>
                          {farm.farm.address}, {farm.farm.ward},{" "}
                          {farm.farm.district}, {farm.farm.province}
                        </TextCustom>
                      </View>

                      {/* Farm Info */}
                      <View style={styles.infoContainer}>
                        <View style={styles.infoItem}>
                          <TextCustom style={styles.infoLabel}>
                            Created Date
                          </TextCustom>
                          <TextCustom style={styles.infoValue}>
                            {formatDate(farm.farm.createDate)}
                          </TextCustom>
                        </View>
                        <View style={styles.infoItem}>
                          <TextCustom style={styles.infoLabel}>
                            Status
                          </TextCustom>
                          <View
                            style={[
                              styles.statusTag,
                              isInactive
                                ? styles.inactiveTag
                                : styles.activeTag,
                            ]}
                          >
                            <TextCustom
                              style={[
                                styles.statusText,
                                isInactive
                                  ? styles.inactiveText
                                  : styles.activeText,
                              ]}
                            >
                              {isInactive ? "Inactive" : "Active"}
                            </TextCustom>
                          </View>
                        </View>
                      </View>

                      {/* Footer */}
                      <View style={styles.footer}>
                        <Badge
                          backgroundColor={
                            roleColorMap[farm.roleId] || "$info500"
                          }
                          borderRadius="$lg"
                          px="$2"
                          py="$1"
                        >
                          <TextCustom
                            style={{
                              padding: 7,
                              ...(farm.roleName == "Owner"
                                ? styles.ownerText
                                : styles.otherText),
                            }}
                          >
                            {farm.roleName}
                          </TextCustom>
                        </Badge>
                        <TextCustom style={styles.dateText}>
                          Since{" "}
                          {new Date(farm.farm.createDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </TextCustom>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

export default FarmPickerScreen;
