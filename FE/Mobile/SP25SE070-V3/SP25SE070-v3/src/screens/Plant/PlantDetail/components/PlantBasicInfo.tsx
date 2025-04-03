// components/plant/PlantBasicInfo.tsx
import TextCustom from 'components/TextCustom';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PlantBasicInfoProps {
    plantingDate: string;
    description: string;
    characteristic: string;
    landPlotName: string;
    rowIndex: number;
}

const PlantBasicInfo: React.FC<PlantBasicInfoProps> = ({
    plantingDate,
    description,
    characteristic,
    landPlotName,
    rowIndex,
}) => {
    return (
        <View style={styles.container}>
            <TextCustom style={styles.sectionTitle}>Basic Information</TextCustom>
            
            <View style={styles.infoRow}>
                <TextCustom style={styles.label}>Planting Date:</TextCustom>
                <TextCustom style={styles.value}>{new Date(plantingDate).toLocaleDateString()}</TextCustom>
            </View>
            
            <View style={styles.infoRow}>
                <TextCustom style={styles.label}>Location:</TextCustom>
                <TextCustom style={styles.value}>{landPlotName}, Row {rowIndex}</TextCustom>
            </View>
            
            {description && (
                <View style={styles.infoRow}>
                    <TextCustom style={styles.label}>Description:</TextCustom>
                    <TextCustom style={styles.value}>{description}</TextCustom>
                </View>
            )}
            
            {characteristic && (
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Characteristics:</Text>
                    <Text style={styles.value}>{characteristic}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        margin: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    label: {
        fontWeight: '600',
        width: 120,
        color: '#555',
    },
    value: {
        flex: 1,
        color: '#333',
    },
});

export default PlantBasicInfo;