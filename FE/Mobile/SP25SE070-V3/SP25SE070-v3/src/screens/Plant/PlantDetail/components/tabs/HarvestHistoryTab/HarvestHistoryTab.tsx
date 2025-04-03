import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  Animated,
} from 'react-native';
import CustomIcon from 'components/CustomIcon';
import { LinearGradient } from 'expo-linear-gradient';
import { PlantDetailData } from '@/types/plant';
import { styles } from './HarvestHistoryTab.styles';
import TextCustom from 'components/TextCustom';
import theme from '@/theme';

type OptionType = {
  id: number;
  name: string;
};

type DropdownType = 'yearFrom' | 'yearTo' | 'product';

const HarvestHistoryTab: React.FC<{ plant: PlantDetailData }> = ({ plant }) => {
  const [yearFrom, setYearFrom] = useState<number>(2024);
  const [yearTo, setYearTo] = useState<number>(2025);
  const [productId, setProductId] = useState<number>(31);
  const [modalVisible, setModalVisible] = useState<DropdownType | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Giả lập dữ liệu
  const mockData = {
    yearFrom,
    yearTo,
    harvestCount: 2,
    masterTypeId: productId,
    masterTypeCode: productId === 31 ? 'MT031' : 'MT032',
    masterTypeName: productId === 31 ? 'Grade 2' : 'Grade 1',
    totalYearlyQuantity: 400,
    numberHarvest: 2,
    monthlyData: [
      { month: 3, year: 2024, totalQuantity: 190, harvestCount: 1 },
      { month: 9, year: 2024, totalQuantity: 210, harvestCount: 1 },
    ].filter((item) => item.year >= yearFrom && item.year <= yearTo),
  };

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [mockData]);

  const years = [
    { id: 2023, name: '2023' },
    { id: 2024, name: '2024' },
    { id: 2025, name: '2025' },
    { id: 2026, name: '2026' },
  ];
  const products = [
    { id: 31, name: 'Grade 2' },
    { id: 32, name: 'Grade 1' },
  ];

  const isProduct = (item: number | OptionType): item is OptionType => typeof item === 'object';

  const renderDropdown = (
    label: string,
    value: number,
    setValue: React.Dispatch<React.SetStateAction<number>>,
    options: OptionType[],
    type: DropdownType,
    setModalVisible: React.Dispatch<React.SetStateAction<DropdownType | null>>
  ) => {
    const displayValue = type === 'product'
      ? (options as OptionType[]).find((p) => p.id === value)?.name || 'Unknown'
      : value;

    return (
      <View style={styles.pickerWrapper}>
        <TextCustom style={styles.filterLabel}>{label}</TextCustom>
        <TouchableOpacity
          style={[styles.dropdownButton, theme.shadow.default]}
          onPress={() => setModalVisible(type)}
        >
          <TextCustom style={styles.dropdownText}>{displayValue}</TextCustom>
          <CustomIcon
            name="chevron-down"
            size={20}
            color="#064944"
            type="MaterialCommunityIcons"
          />
        </TouchableOpacity>

        <Modal
          visible={modalVisible === type}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(null)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setModalVisible(null)}
          >
            <View style={styles.modalContent}>
              <FlatList
                data={options}
                keyExtractor={(item) => `${type}-${isProduct(item) ? item.id : item}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.optionItem}
                    onPress={() => {
                      setValue(isProduct(item) ? item.id : item);
                      setModalVisible(null);
                    }}
                  >
                    <TextCustom style={styles.optionText}>
                      {isProduct(item) ? item.name : item}
                    </TextCustom>
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* filter */}
      <LinearGradient
        colors={['#fffcee', '#fffcee']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.filterContainer}
      >
        <View style={styles.filterRow}>
          {renderDropdown('From', yearFrom, setYearFrom, years, 'yearFrom', setModalVisible)}
          {renderDropdown('To', yearTo, setYearTo, years, 'yearTo', setModalVisible)}
          {renderDropdown('Product', productId, setProductId, products, 'product', setModalVisible)}
        </View>
      </LinearGradient>

      <View style={styles.dividerHorizontal} />

      {/* cards */}
      <ScrollView contentContainerStyle={styles.content}>
        {mockData.monthlyData.length > 0 ? (
          mockData.monthlyData.map((item, index) => (
            <View key={`${item.month}-${item.year}`}>
              <LinearGradient
                colors={['#BCD379', '#BCD379']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.tag}
              >
                <TextCustom style={styles.tagText}>
                  {new Date(item.year, item.month - 1).toLocaleString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </TextCustom>
              </LinearGradient>
              <Animated.View

                style={[styles.card, { opacity: fadeAnim }]}
              >
                <View style={styles.cardContent}>
                  <View style={styles.headerRow}>
                    <View
                      style={styles.quantityBadge}
                    >
                      <TextCustom style={styles.quantityText}>
                        {item.totalQuantity} kg
                      </TextCustom>
                    </View>
                    <TextCustom style={styles.productType}>{mockData.masterTypeName}</TextCustom>
                  </View>

                  <View style={styles.detailRow}>
                    <CustomIcon
                      name="fruit-watermelon"
                      size={22}
                      color="#FF9800"
                      type="MaterialCommunityIcons"
                    />
                    <TextCustom style={styles.detailText}>Pomelo Fruit</TextCustom>
                  </View>

                  <View style={styles.detailRow}>
                    <CustomIcon
                      name="cash"
                      size={22}
                      color="#4CAF50"
                      type="MaterialCommunityIcons"
                    />
                    <TextCustom style={styles.detailText}>
                      Market Value: ${(item.totalQuantity * 2.5).toFixed(2)}
                    </TextCustom>
                  </View>

                  <View style={styles.detailRow}>
                    <CustomIcon
                      name="repeat"
                      size={22}
                      color="#2196F3"
                      type="MaterialCommunityIcons"
                    />
                    <TextCustom style={styles.detailText}>
                      Harvested {item.harvestCount} time{item.harvestCount > 1 ? 's' : ''}
                    </TextCustom>
                  </View>
                </View>
              </Animated.View>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <LinearGradient
              colors={['#f0f0f0', '#e0e0e0']}
              style={styles.emptyIconWrapper}
            >
              <CustomIcon
                name="basket"
                size={60}
                color="#999"
                type="MaterialCommunityIcons"
              />
            </LinearGradient>
            <TextCustom style={styles.emptyText}>No harvest history found</TextCustom>
          </View>
        )}
      </ScrollView>
    </View>
  );
};



export default HarvestHistoryTab;