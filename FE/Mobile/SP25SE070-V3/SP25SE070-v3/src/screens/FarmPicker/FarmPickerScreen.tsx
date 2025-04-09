import React, { useEffect, useState } from "react";
import { View, Image, TouchableOpacity, ScrollView } from "react-native";
import { formatDate, getRoleId, getUserId } from "@/utils/UtilFunction";
import { Tag } from "native-base";
import { styles } from "./FarmPickerScreen.styles";
import { Loading, TextCustom } from "@/components";
import { useAuthStore } from "@/store";
import { GetFarmPicker } from "@/payloads";
import { AuthService, FarmService } from "@/services";
import { AuthNavigationProp, ROUTE_NAMES, UserRole } from "@/constants";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";

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
        } else {
          console.error("Failed to fetch farms:", result.message);
        }
      } catch (error) {
        console.error("Error fetching farms:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFarms();
  }, []);

  // const generateFakeFarms = (): FakeFarmPicker[] => {
  //   return [
  //     {
  //       farm: {
  //         farmId: 1,
  //         farmName: "Sunny Valley Farm",
  //         logoUrl:
  //           "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500",
  //         address: "123 Green Road",
  //         ward: "Meadow Ward",
  //         district: "Agricultural District",
  //         province: "Green Province",
  //         status: "Active",
  //         createDate: "2023-01-15T08:30:00Z",
  //       },
  //       roleId: "1",
  //       roleName: "Owner",
  //       isActive: true,
  //     },
  //     {
  //       farm: {
  //         farmId: 2,
  //         farmName: "Mountain Top Ranch",
  //         logoUrl:
  //           "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=500",
  //         address: "456 Highland Ave",
  //         ward: "Peak Ward",
  //         district: "Mountain District",
  //         province: "Highland Province",
  //         status: "Active",
  //         createDate: "2023-03-22T10:15:00Z",
  //       },
  //       roleId: "2",
  //       roleName: "Manager",
  //       isActive: true,
  //     },
  //     {
  //       farm: {
  //         farmId: 3,
  //         farmName: "River Side Farm",
  //         logoUrl:
  //           "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=500",
  //         address: "789 Waterside Blvd",
  //         ward: "River Ward",
  //         district: "Delta District",
  //         province: "Waterland Province",
  //         status: "Inactive",
  //         createDate: "2022-11-05T14:45:00Z",
  //       },
  //       roleId: "3",
  //       roleName: "Employee",
  //       isActive: false,
  //     },
  //   ];
  // };

  const handleCardClick = async (farmId: number) => {
    const res = await AuthService.refreshTokenInFarm(farmId);
    if (res.statusCode === 200) {
      const roleId = getRoleId(res.data.accessToken);
      const userId = getUserId(res.data.accessToken);
      useAuthStore.getState().updateRoleInFarm(res.data, userId, roleId);
      switch (roleId) {
        case UserRole.Owner.toString():
        case UserRole.Manager.toString():
          navigation.navigate(ROUTE_NAMES.MAIN.DRAWER, {
            screen: ROUTE_NAMES.MAIN.MAIN_TABS,
          });
          break;
        case UserRole.Employee.toString():
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
                              {farm.farm.status}
                            </TextCustom>
                          </View>
                        </View>
                      </View>

                      {/* Footer */}
                      <View style={styles.footer}>
                        <Tag
                          style={[
                            styles.statusTag,
                            farm.roleId == UserRole.Owner.toString()
                              ? styles.owner
                              : styles.other,
                          ]}
                        >
                          <TextCustom
                            style={[
                              styles.statusTag,
                              farm.roleId == UserRole.Owner.toString()
                                ? styles.ownerText
                                : styles.otherText,
                            ]}
                          >
                            {farm.roleName}
                          </TextCustom>
                        </Tag>
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
