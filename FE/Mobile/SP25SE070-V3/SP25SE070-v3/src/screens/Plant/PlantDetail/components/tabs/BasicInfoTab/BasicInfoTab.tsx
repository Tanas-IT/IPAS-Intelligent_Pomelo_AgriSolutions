import React, { FC } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { PlantDetailData } from '@/types/plant';
import CustomIcon from 'components/CustomIcon';
import { LinearGradient } from 'expo-linear-gradient';
import RNPickerSelect from 'react-native-picker-select';
import { styles } from './BasicInfoTab.styles';
import TextCustom from 'components/TextCustom';
import theme from '@/theme';

const BasicInfoTab: FC<{ plant: PlantDetailData }> = ({ plant }) => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.tagContainer}>
        <LinearGradient
          colors={['#BCD379', '#BCD379']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.tag}
        >
          <TextCustom style={styles.tagText}>Plant Information</TextCustom>
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
          <TextCustom style={styles.descriptionText}>{plant.description}</TextCustom>
        </View>
      )}
    </ScrollView>
  );
};

const InfoRow = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <View style={styles.infoRow}>
    <CustomIcon name={icon} size={18} color={theme.colors.primary} type="MaterialCommunityIcons" />
    <TextCustom style={styles.label}>{label}:</TextCustom>
    <TextCustom style={styles.value}>{value}</TextCustom>
  </View>
);



export default BasicInfoTab;
