import React, { useEffect } from "react";
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
import { HarvestRecord, UpdateHarvestRecordRequest } from "@/types/harvest";
import { harvestUpdateRecordSchema } from "@/validations/harvestSchema";
import { CustomIcon, TextCustom } from "@/components";
import theme from "@/theme";

interface UpdateRecordModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: UpdateHarvestRecordRequest) => void;
  record: HarvestRecord;
}

interface FormData {
  quantity: number;
}

const UpdateRecordModal: React.FC<UpdateRecordModalProps> = ({
  visible,
  onClose,
  onSubmit,
  record,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(harvestUpdateRecordSchema),
    defaultValues: {
      quantity: record.actualQuantity,
    },
  });

  useEffect(() => {
    if (visible) {
      reset({ quantity: record.actualQuantity });
    }
  }, [visible, record, reset]);

  const handleFormSubmit = (data: FormData) => {
    const recordData: UpdateHarvestRecordRequest = {
      productHarvestHistoryId: record.productHarvestHistoryId,
      quantity: data.quantity,
    };

    onSubmit(recordData);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TextCustom style={styles.modalTitle}>
                Edit Yield Record
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
              <TextCustom style={styles.label}>
                Yield <TextCustom style={{ color: "red" }}>*</TextCustom>
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
                    placeholder="Enter Yield"
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
              <TextCustom style={styles.submitButtonText}>Update</TextCustom>
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

export default UpdateRecordModal;
