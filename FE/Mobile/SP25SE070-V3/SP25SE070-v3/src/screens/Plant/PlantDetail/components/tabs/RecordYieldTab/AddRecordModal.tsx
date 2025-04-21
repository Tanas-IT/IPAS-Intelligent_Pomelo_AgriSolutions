import React, { useState, useEffect } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
} from "react-native";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  CreateHarvestRecordRequest,
  AvailableHarvest,
  ProductHarvest,
} from "@/types/harvest";
import { harvestRecordSchema } from "@/validations/harvestSchema";
import { CustomDropdown, CustomIcon, TextCustom } from "@/components";
import { PlantService } from "@/services";
import theme from "@/theme";
import { useAuthStore } from "@/store";
import { formatDate } from "@/utils";

interface AddRecordModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateHarvestRecordRequest) => void;
  plantId: number;
}

interface FormData {
  harvestHistoryId: number;
  masterTypeId: number;
  quantity: number;
}

const AddRecordModal: React.FC<AddRecordModalProps> = ({
  visible,
  onClose,
  onSubmit,
  plantId,
}) => {
  const { userId } = useAuthStore();
  const [modalVisible, setModalVisible] = useState<string | null>(null);
  const [availableHarvests, setAvailableHarvests] = useState<
    AvailableHarvest[]
  >([]);
  const [productOptions, setProductOptions] = useState<
    { id: number; name: string }[]
  >([]);
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: yupResolver(harvestRecordSchema),
    defaultValues: {
      harvestHistoryId: 0,
      masterTypeId: 0,
      quantity: 0,
    },
  });

  const selectedHarvestId = watch("harvestHistoryId");

  useEffect(() => {
    if (visible) {
      const fetchHarvests = async () => {
        const response = await PlantService.getAvailableHarvestsForPlant(
          plantId
        );
        setAvailableHarvests(response.data);
      };
      fetchHarvests();
    }
  }, [visible, plantId]);

  useEffect(() => {
    if (selectedHarvestId) {
      const selectedHarvest = availableHarvests.find(
        (h) => h.harvestHistoryId === selectedHarvestId
      );
      if (selectedHarvest) {
        const products = selectedHarvest.productHarvestHistory.map((p) => ({
          id: p.masterTypeId,
          name: p.productName,
        }));
        setProductOptions(products);
        setValue("masterTypeId", 0);
      } else {
        setProductOptions([]);
      }
    } else {
      setProductOptions([]);
    }
  }, [selectedHarvestId, availableHarvests, setValue]);

  const handleFormSubmit = (data: FormData) => {
    const recordData: CreateHarvestRecordRequest = {
      masterTypeId: data.masterTypeId,
      harvestHistoryId: data.harvestHistoryId,
      userId: Number(userId) || 1,
      plantHarvestRecords: [
        {
          plantId,
          quantity: data.quantity,
        },
      ],
    };
    onSubmit(recordData);
    reset();
  };

  const harvestOptions = availableHarvests.map((h) => ({
    id: h.harvestHistoryId,
    code: `${h.cropName} - ${formatDate(h.dateHarvest)}`,
  }));

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
                label="Harvest Day"
                name="harvestHistoryId"
                control={control}
                errors={errors}
                options={harvestOptions}
                valueKey="id"
                displayKey="code"
                placeholder="Select Harvest Day"
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                modalKey="harvest"
              />
              <CustomDropdown
                label="Product Type"
                name="masterTypeId"
                control={control}
                errors={errors}
                options={productOptions}
                valueKey="id"
                displayKey="name"
                placeholder="Select Product Type"
                modalVisible={modalVisible}
                setModalVisible={setModalVisible}
                modalKey="product"
                disabled={!selectedHarvestId} // Vô hiệu hóa nếu chưa chọn harvest
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
