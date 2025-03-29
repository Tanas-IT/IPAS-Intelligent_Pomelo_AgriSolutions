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
        <Text style={styles.filterLabel}>{label}</Text>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setModalVisible(type)}
        >
          <Text style={styles.dropdownText}>{displayValue}</Text>
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
                    <Text style={styles.optionText}>
                      {isProduct(item) ? item.name : item}
                    </Text>
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
      {/* Bộ lọc */}
      <LinearGradient
        colors={['#BCD379', '#064944']}
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

      {/* Danh sách card */}
      <ScrollView contentContainerStyle={styles.content}>
        {mockData.monthlyData.length > 0 ? (
          mockData.monthlyData.map((item, index) => (
            <View key={`${item.month}-${item.year}`}>
              <LinearGradient
                colors={['#BCD379', '#064944']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.tag}
              >
                {/* <View style={styles.tag}> */}
                <Text style={styles.tagText}>
                  {new Date(item.year, item.month - 1).toLocaleString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
                {/* </View> */}
              </LinearGradient>
              <Animated.View

                style={[styles.card, { opacity: fadeAnim }]}
              >


                <View style={styles.cardContent}>
                  <View style={styles.headerRow}>
                    <View
                      style={styles.quantityBadge}
                    >
                      <Text style={styles.quantityText}>
                        {item.totalQuantity} kg
                      </Text>
                    </View>
                    <Text style={styles.productType}>{mockData.masterTypeName}</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <CustomIcon
                      name="fruit-watermelon"
                      size={22}
                      color="#FF9800"
                      type="MaterialCommunityIcons"
                    />
                    <Text style={styles.detailText}>Pomelo Fruit</Text>
                  </View>

                  <View style={styles.detailRow}>
                    <CustomIcon
                      name="cash"
                      size={22}
                      color="#4CAF50"
                      type="MaterialCommunityIcons"
                    />
                    <Text style={styles.detailText}>
                      Market Value: ${(item.totalQuantity * 2.5).toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.detailRow}>
                    <CustomIcon
                      name="repeat"
                      size={22}
                      color="#2196F3"
                      type="MaterialCommunityIcons"
                    />
                    <Text style={styles.detailText}>
                      Harvested {item.harvestCount} time{item.harvestCount > 1 ? 's' : ''}
                    </Text>
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
            <Text style={styles.emptyText}>No harvest history found</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fffcee',
  },
  filterContainer: {
    padding: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pickerWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
  filterLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  dropdownText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: '80%',
    maxHeight: 200,
    padding: 10,
  },
  optionItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  optionText: {
    color: '#333',
    fontSize: 16,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
    marginTop: 30
  },
  tag: {
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'center',
    position: 'absolute',
    top: 10,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  tagText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  cardContent: {
    padding: 20,
    paddingTop: 50,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  quantityBadge: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 25,
    borderColor: '#064944',
    borderWidth: 1,
  },
  quantityText: {
    color: '#064944',
    fontSize: 16,
    fontWeight: '300',
  },
  productType: {
    fontSize: 16,
    color: '#555',
    fontWeight: '500',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    fontWeight: '400',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyIconWrapper: {
    padding: 25,
    borderRadius: 60,
    marginBottom: 20,
  },
  emptyText: {
    color: '#777',
    fontSize: 20,
    fontWeight: '500',
  },
});

export default HarvestHistoryTab;