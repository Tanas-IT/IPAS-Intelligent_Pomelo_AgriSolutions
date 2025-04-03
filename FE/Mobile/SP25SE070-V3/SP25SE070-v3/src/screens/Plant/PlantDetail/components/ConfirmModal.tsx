import React from 'react';
import { View, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import TextCustom from 'components/TextCustom';
import theme from '@/theme';

interface ConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ visible, onClose, onConfirm }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TextCustom style={styles.modalTitle}>Confirm Submission</TextCustom>
          <TextCustom style={styles.modalMessage}>
            Are you sure you want to submit this record? It will be merged with existing data and cannot be undone.
          </TextCustom>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <TextCustom style={styles.buttonText}>Cancel</TextCustom>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
              <TextCustom style={styles.buttonText}>Confirm</TextCustom>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F44336',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    marginRight: 10,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: theme.colors.btnYellow,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default ConfirmModal;