import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { formatDate } from '@/utils/UtilFunction';
import { Tag } from 'native-base';
import BackButton from 'components/BackButton';
import { ROUTE_NAMES } from '@/navigation/RouteNames';
import theme from '@/theme';
import { styles } from './FarmPickerScreen.styles';
import Loading from 'components/Loading';

interface Farm {
  farmId: number;
  farmName: string;
  logoUrl: string;
  address: string;
  ward: string;
  district: string;
  province: string;
  status: string;
  createDate: string;
}

interface FakeFarmPicker {
  farm: Farm;
  roleId: string;
  roleName: string;
  isActive: boolean;
}

const FarmPickerScreen = () => {
  const [farmsData, setFarmsData] = useState<FakeFarmPicker[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFarmsData(generateFakeFarms());
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const generateFakeFarms = (): FakeFarmPicker[] => {
    return [
      {
        farm: {
          farmId: 1,
          farmName: "Sunny Valley Farm",
          logoUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500",
          address: "123 Green Road",
          ward: "Meadow Ward",
          district: "Agricultural District",
          province: "Green Province",
          status: "Active",
          createDate: "2023-01-15T08:30:00Z",
        },
        roleId: "1",
        roleName: "Owner",
        isActive: true,
      },
      {
        farm: {
          farmId: 2,
          farmName: "Mountain Top Ranch",
          logoUrl: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=500",
          address: "456 Highland Ave",
          ward: "Peak Ward",
          district: "Mountain District",
          province: "Highland Province",
          status: "Active",
          createDate: "2023-03-22T10:15:00Z",
        },
        roleId: "2",
        roleName: "Manager",
        isActive: true,
      },
      {
        farm: {
          farmId: 3,
          farmName: "River Side Farm",
          logoUrl: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=500",
          address: "789 Waterside Blvd",
          ward: "River Ward",
          district: "Delta District",
          province: "Waterland Province",
          status: "Inactive",
          createDate: "2022-11-05T14:45:00Z",
        },
        roleId: "3",
        roleName: "Employee",
        isActive: false,
      },
    ];
  };

  const handleCardClick = (farmId: number) => {
    console.log(`Selected farm: ${farmId}`);
  };

  if (loading) {
    return (
      <Loading/>
    );
  }

  return (
    <View style={styles.container}>
      <BackButton
        targetScreen={ROUTE_NAMES.MAIN.DRAWER}
        targetParams={{ screen: 'MainTabs', params: { initialRoute: 'Home' } }}
      />
      <Text style={styles.headerTitle}>Select Your Farm</Text>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {farmsData.map((farm) => {
          const isInactive = farm.farm.status.toLowerCase() === "inactive" || !farm.isActive;

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
              <View style={[
                styles.card,
                isInactive && styles.inactiveCard
              ]}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => !isInactive && handleCardClick(farm.farm.farmId)}
                >
                  <View style={styles.cardContent}>
                    <Text style={styles.farmName}>{farm.farm.farmName}</Text>

                    <View style={styles.addressContainer}>
                      <Text style={styles.addressText}>{farm.farm.address}</Text>
                      <Text style={styles.addressText}>{farm.farm.ward}, {farm.farm.district}</Text>
                      <Text style={styles.addressText}>{farm.farm.province}</Text>
                    </View>

                    {/* Farm Info */}
                    <View style={styles.infoContainer}>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Expired Date</Text>
                        <Text style={styles.infoValue}>{formatDate(farm.farm.createDate)}</Text>
                      </View>
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Status</Text>
                        <Text style={[
                          styles.statusText,
                          isInactive ? styles.inactiveStatus : styles.activeStatus
                        ]}>
                          {farm.farm.status}
                        </Text>
                      </View>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                      <Tag
                        style={[
                          styles.statusTag,
                          farm.roleId === "1"
                            ? styles.owner
                            : farm.roleId === "2"
                              ? styles.manager
                              : farm.roleId === "3"
                                ? styles.employee
                                : styles.other
                        ]}
                      >
                        {farm.roleName}
                      </Tag>
                      <Text style={styles.dateText}>
                        Since {new Date(farm.farm.createDate).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric'
                        })}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};



export default FarmPickerScreen;