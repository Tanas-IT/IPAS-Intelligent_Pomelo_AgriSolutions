import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { PlantDetailData } from '@/types/plant';
import CustomIcon from 'components/CustomIcon';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '@/navigation/Types';
import { ROUTE_NAMES } from '@/navigation/RouteNames';

const PlantHeader: React.FC<{ plant: PlantDetailData }> = ({ plant }) => {
  const navigation = useNavigation<RootStackNavigationProp>();
  return (
    <View style={styles.header}>
      <LinearGradient
        colors={['#BCD379', '#064944']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.image}
      />
      <TouchableOpacity
        style={[
          styles.backButton,
          { position: 'absolute', top: 30, left: 10, zIndex: 100 }
        ]}
        onPress={() => navigation.navigate(ROUTE_NAMES.MAIN.DRAWER, {
          screen: ROUTE_NAMES.MAIN.MAIN_TABS
        })}
      >
        <CustomIcon
          name="arrow-left"
          size={24}
          color="white"
          type="MaterialCommunityIcons"
        />
      </TouchableOpacity>

      <View style={styles.overlay}>
        <View style={styles.qrContainer}>
          <QRCode
            value={`plant:${plant.plantId}`}
            size={70}
            backgroundColor="transparent"
            color="black"
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.plantName}>{plant.plantName}</Text>
          <Text style={styles.plantCode}>{plant.plantCode}</Text>

          <View style={styles.statusRow}>
            <View style={[
              styles.statusBadge,
              plant.healthStatus === 'Good' && styles.goodStatus,
              plant.healthStatus === 'Moderate' && styles.moderateStatus,
              plant.healthStatus === 'Poor' && styles.poorStatus,
            ]}>
              <Text style={styles.statusText}>{plant.healthStatus}</Text>
            </View>

            <View style={styles.spacer} />

            <View style={styles.growthStageBadge}>
              <CustomIcon
                name="leaf"
                size={16}
                color="#4CAF50"
                type="MaterialCommunityIcons"
              />
              <Text style={styles.growthStageText}>{plant.growthStageName}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 220,
    backgroundColor: 'white',
    // position: 'relative',
  },
  image: {
    // width: '100%',
    // height: '100%',
    // resizeMode: 'cover',
    // position: 'absolute',
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    paddingBottom: 20,
  },
  qrContainer: {
    backgroundColor: 'white',
    padding: 4,
    borderRadius: 8,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  plantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  plantCode: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  goodStatus: {
    backgroundColor: '#4CAF50',
  },
  moderateStatus: {
    backgroundColor: '#FFC107',
  },
  poorStatus: {
    backgroundColor: '#F44336',
  },
  statusText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 13,
  },
  spacer: {
    flex: 1,
  },
  growthStageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  growthStageText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 13,
    marginLeft: 6,
  },
  backButton: {
    position: 'absolute',
    top: 40, // Điều chỉnh phù hợp với UI
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 8,
    borderRadius: 20,
  },

});

export default PlantHeader;