import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { PlantDetailData } from '@/types/plant';
import CustomIcon from 'components/CustomIcon';
import { LinearGradient } from 'expo-linear-gradient';

const GraftedPlantsTab: React.FC<{ plant: PlantDetailData }> = ({ plant }) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {plant.graftedPlants.length > 0 ? (
        plant.graftedPlants.map(grafted => (
          <TouchableOpacity
            key={grafted.graftedPlantID}
            style={styles.card}
            activeOpacity={0.8}
          >
            <View style={styles.tagContainer}>
              <LinearGradient
                colors={['#BCD379', '#064944']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.tag}
              >
                <Text style={styles.tagText}>{new Date(grafted.graftedDate).toLocaleDateString()}</Text>
              </LinearGradient>
            </View>
            <View style={styles.cardHeader}>
              <View style={[
                styles.statusBadge,
                grafted.status === 'Healthy' && styles.healthyStatus,
                grafted.status === 'Used' && styles.usedStatus,
                grafted.status === 'Issue' && styles.issuedStatus,
              ]}>
                <Text style={styles.statusText}>{grafted.status}</Text>
              </View>
            </View>

            <Text style={styles.plantName}>{grafted.graftedPlantName}</Text>
            <Text style={styles.plantCode}>Code: {grafted.graftedPlantCode}</Text>

            <View style={styles.detailRow}>
              <CustomIcon name="tag" size={16} color="#2196F3" type="MaterialCommunityIcons" />
              <Text style={styles.detailText}>Lot: {grafted.plantLotID || 'N/A'}</Text>
            </View>

            <TouchableOpacity style={styles.detailButton}>
              <Text style={styles.detailButtonText}>View Details</Text>
              <CustomIcon name="chevron-right" size={16} color="#064944" type="MaterialCommunityIcons" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptyContainer}>
          <CustomIcon name="tree" size={40} color="#ccc" type="MaterialCommunityIcons" />
          <Text style={styles.emptyText}>No grafted plants from this plant</Text>
        </View>
      )}
    </ScrollView>
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
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginTop: 20
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  dateText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 5,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  healthyStatus: {
    backgroundColor: '#4CAF50',
  },
  usedStatus: {
    backgroundColor: '#2196F3',
  },
  issuedStatus: {
    backgroundColor: '#F44336',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  plantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  plantCode: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  detailButtonText: {
    color: '#064944',
    fontWeight: '500',
    marginRight: 5,
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
  tagContainer: {
    alignItems: 'center',
    marginBottom: 15,
    zIndex: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    marginTop: -30
  },
  tag: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  tagText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GraftedPlantsTab;