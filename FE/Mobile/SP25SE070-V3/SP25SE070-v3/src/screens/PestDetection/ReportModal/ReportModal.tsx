import React from "react";
import { View, Modal, TouchableOpacity, TextInput } from "react-native";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { PestReportRequest } from "@/types/pestDetection";
import { styles } from "../PestDetection.styles";
import { reportSchema } from "@/validations/reportSchema";
import { TextCustom } from "@/components";

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: PestReportRequest) => void;
}

interface FormData {
  description: string;
  questionOfUser: string;
}

const ReportModal: React.FC<ReportModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: yupResolver(reportSchema),
    defaultValues: {
      description: "",
      questionOfUser: "",
    },
  });

  const handleFormSubmit = (data: FormData) => {
    const reportData: PestReportRequest = {
      description: data.description,
      imageFile: "",
      questionerID: 0,
      questionOfUser: data.questionOfUser,
    };
    onSubmit(reportData);
    reset();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <TextCustom style={styles.modalTitle}>Your Report</TextCustom>
          <Controller
            control={control}
            name="questionOfUser"
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <View>
                <TextCustom style={styles.inputLabel}>
                  Question <TextCustom style={{ color: "red" }}>*</TextCustom>
                </TextCustom>
                <TextInput
                  style={[styles.input, error && { borderColor: "red" }]}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Enter your question..."
                  multiline
                />
                {error && (
                  <TextCustom style={styles.errorText}>
                    {error.message}
                  </TextCustom>
                )}
              </View>
            )}
          />
          <Controller
            control={control}
            name="description"
            render={({
              field: { onChange, onBlur, value },
              fieldState: { error },
            }) => (
              <View>
                <TextCustom style={styles.inputLabel}>
                  Description{" "}
                  <TextCustom style={{ color: "red" }}>*</TextCustom>
                </TextCustom>
                <TextInput
                  style={[styles.input, error && { borderColor: "red" }]}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Enter your description..."
                  multiline
                />
                {error && (
                  <TextCustom style={styles.errorText}>
                    {error.message}
                  </TextCustom>
                )}
              </View>
            )}
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[
                styles.modalButton,
                {
                  backgroundColor: "white",
                  borderWidth: 1,
                  borderColor: "#888",
                },
              ]}
              onPress={onClose}
            >
              <TextCustom style={[styles.modalButtonText, { color: "#888" }]}>
                Cancel
              </TextCustom>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleSubmit(handleFormSubmit)}
            >
              <TextCustom style={styles.modalButtonText}>Send</TextCustom>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ReportModal;
