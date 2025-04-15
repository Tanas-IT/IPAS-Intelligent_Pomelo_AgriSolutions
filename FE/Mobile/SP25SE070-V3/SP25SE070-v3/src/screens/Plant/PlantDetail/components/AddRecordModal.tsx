import React, { useState } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import {
  CreateHarvestRecordRequest,
  MasterTypeOption,
  HarvestHistoryOption,
} from "@/types/harvest";
import { harvestRecordSchema } from "@/validations/harvestSchema";
import theme from "@/theme";
import { CustomDropdown, CustomIcon, TextCustom } from "@/components";
import useMasterTypeOptions from "@/hooks/useMasterTypeOptions";
import { MASTER_TYPE } from "@/constants";

interface AddRecordModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateHarvestRecordRequest) => void;
  masterTypeOptions: MasterTypeOption[];
  harvestHistoryOptions: HarvestHistoryOption[];
  plantId: number;
}

interface FormData {
  masterTypeId: number;
  harvestHistoryId: number;
  quantity: number;
}

const AddRecordModal: React.FC<AddRecordModalProps> = ({
  visible,
  onClose,
  onSubmit,
  masterTypeOptions,
  harvestHistoryOptions,
  plantId,
}) => {
  const [modalVisible, setModalVisible] = useState<string | null>(null);
  const { options: productOptions } = useMasterTypeOptions("Product");
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(harvestRecordSchema),
    defaultValues: {
      masterTypeId: 0,
      harvestHistoryId: 0,
      quantity: 0,
    },
  });

  const handleFormSubmit = (data: FormData) => {
    const recordData: CreateHarvestRecordRequest = {
      masterTypeId: data.masterTypeId,
      plantId,
      quantity: data.quantity,
      harvestHistoryId: data.harvestHistoryId,
    };
    onSubmit(recordData);
    reset();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TextCustom style={styles.modalTitle}>
                Add Yield Record
              </TextCustom>
              <TouchableOpacity onPress={onClose}>
                <CustomIcon
                  name="close"
                  size={24}
                  color="#064944"
                  type="MaterialCommunityIcons"
                />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <CustomDropdown
                label="Product Type"
                name="masterTypeId"
                control={control}
                errors={errors}
                options={productOptions}
                valueKey="value"
                displayKey="label"
                placeholder="Select Product Type"
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                modalKey="product"
              />
              <CustomDropdown
                label="Harvest Session"
                name="harvestHistoryId"
                control={control}
                errors={errors}
                options={harvestHistoryOptions}
                valueKey="id"
                displayKey="code"
                placeholder="Select Harvest Session"
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                modalKey="harvest"
              />

              <TextCustom style={styles.label}>
                Quantity <TextCustom style={{ color: "red" }}>*</TextCustom>
              </TextCustom>
              <Controller
                control={control}
                name="quantity"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      errors.quantity && { borderColor: "red" },
                    ]}
                    keyboardType="numeric"
                    value={value.toString()}
                    onChangeText={(text) => onChange(parseFloat(text) || 0)}
                    onBlur={onBlur}
                    placeholder="Enter quantity"
                  />
                )}
              />
              {errors.quantity && (
                <TextCustom style={styles.errorText}>
                  {errors.quantity.message}
                </TextCustom>
              )}
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit(handleFormSubmit)}
            >
              <TextCustom style={styles.submitButtonText}>Submit</TextCustom>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
  form: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: theme.colors.primary,
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    color: "#333",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  errorText: {
    fontSize: 12,
    color: "red",
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: theme.colors.secondary,
    borderRadius: 10,
    padding: 15,
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: theme.colors.primary,
  },
});

export default AddRecordModal;
