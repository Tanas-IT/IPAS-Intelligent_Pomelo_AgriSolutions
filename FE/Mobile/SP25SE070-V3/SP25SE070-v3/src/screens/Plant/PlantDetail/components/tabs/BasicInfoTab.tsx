import React, { FC } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { PlantDetailData } from '@/types/plant';
import CustomIcon from 'components/CustomIcon';
import { LinearGradient } from 'expo-linear-gradient';
import RNPickerSelect from 'react-native-picker-select';

const BasicInfoTab: FC<{ plant: PlantDetailData }> = ({ plant }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.tagContainer}>
        <LinearGradient
                        colors={['#BCD379', '#064944']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.tag}
                      >
          <Text style={styles.tagText}>Plant Information</Text>
        </LinearGradient>
      </View>
      
      <View style={styles.card}>
        <InfoRow icon="seed" label="Plant Type" value={plant.masterTypeName} />
        <InfoRow icon="calendar" label="Planting Date" 
          value={new Date(plant.plantingDate).toLocaleDateString()} />
        <InfoRow icon="map-marker" label="Location" 
          value={`${plant.landPlotName}, Row ${plant.rowIndex}`} />
        <InfoRow icon="chart-line" label="Current Stage" value={plant.growthStageName} />
      </View>
      
      {plant.description && (
        <View style={styles.card}>
          <Text style={styles.descriptionText}>{plant.description}</Text>
          <RNPickerSelect
      onValueChange={(value) => console.log(value)}
      items={[
        { label: 'Football', value: 'football' },
        { label: 'Baseball', value: 'baseball' },
        { label: 'Hockey', value: 'hockey' },
      ]}
    />
        </View>
      )}
    </ScrollView>
  );
};

const InfoRow = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <View style={styles.infoRow}>
    <CustomIcon name={icon} size={18} color="#666" type="MaterialCommunityIcons" />
    <Text style={styles.label}>{label}:</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  tagContainer: {
    alignItems: 'center',
    marginBottom: -25,
    zIndex: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
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
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 40,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    marginRight: 4,
    width: 100,
  },
  value: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  descriptionText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
  },
});

export default BasicInfoTab;
