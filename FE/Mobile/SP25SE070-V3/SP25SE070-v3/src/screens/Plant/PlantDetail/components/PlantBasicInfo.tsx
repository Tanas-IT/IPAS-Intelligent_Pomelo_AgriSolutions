// components/plant/PlantBasicInfo.tsx
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
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.infoRow}>
                <Text style={styles.label}>Planting Date:</Text>
                <Text style={styles.value}>{new Date(plantingDate).toLocaleDateString()}</Text>
            </View>
            
            <View style={styles.infoRow}>
                <Text style={styles.label}>Location:</Text>
                <Text style={styles.value}>{landPlotName}, Row {rowIndex}</Text>
            </View>
            
            {description && (
                <View style={styles.infoRow}>
                    <Text style={styles.label}>Description:</Text>
                    <Text style={styles.value}>{description}</Text>
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