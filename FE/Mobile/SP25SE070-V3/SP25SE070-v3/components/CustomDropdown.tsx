import React from 'react';
import { View, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { Controller } from 'react-hook-form';
import TextCustom from './TextCustom';
import CustomIcon from './CustomIcon';
import theme from '@/theme';

interface CustomDropdownProps<T> {
  label: string;
  name: string;
  control: any;
  errors: any;
  options: T[];
  valueKey: keyof T;
  displayKey: keyof T;
  placeholder: string;
  modalVisible: string | null;
  setModalVisible: React.Dispatch<React.SetStateAction<string | null>>;
  modalKey: string;
}

const CustomDropdown = <T extends Record<string, any>>({
  label,
  name,
  control,
  errors,
  options,
  valueKey,
  displayKey,
  placeholder,
  modalVisible,
  setModalVisible,
  modalKey,
}: CustomDropdownProps<T>) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => {
        const displayValue =
          options.find((option) => option[valueKey] === value)?.[displayKey] || placeholder;

        return (
          <View style={styles.pickerWrapper}>
            <TextCustom style={styles.label}>
              {label} <TextCustom style={{ color: 'red' }}>*</TextCustom>
            </TextCustom>
            <TouchableOpacity
              style={[styles.dropdownButton, errors[name] && { borderColor: 'red', borderWidth: 1 }]}
              onPress={() => setModalVisible(modalKey)}
            >
              <TextCustom style={styles.dropdownText}>{displayValue}</TextCustom>
              <CustomIcon
                name="chevron-down"
                size={20}
                color="#064944"
                type="MaterialCommunityIcons"
              />
            </TouchableOpacity>
            {errors[name] && (
              <TextCustom style={styles.errorText}>{errors[name].message}</TextCustom>
            )}

            <Modal
              visible={modalVisible === modalKey}
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
                    keyExtractor={(item) => `${modalKey}-${item[valueKey]}`}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.optionItem}
                        onPress={() => {
                          onChange(item[valueKey]);
                          setModalVisible(null);
                        }}
                      >
                        <TextCustom style={styles.optionText}>
                          {item[displayKey]}
                        </TextCustom>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </TouchableOpacity>
            </Modal>
          </View>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  pickerWrapper: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: theme.colors.primary,
    marginBottom: 5,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    width: '80%',
    maxHeight: '50%',
  },
  optionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  optionText: {
    fontSize: 16,
    color: theme.colors.primary,
  },
  errorText: {
    fontSize: 12,
    color: 'red',
    marginBottom: 10,
  },
});

export default CustomDropdown;