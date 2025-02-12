import { useState } from "react";

interface ModalState<T> {
  visible: boolean;
  data?: T;
}

export default function useModal<T>() {
  const [modalState, setModalState] = useState<ModalState<T>>({ visible: false });

  const showModal = (data?: T) => {
    setModalState({ visible: true, data });
  };

  const hideModal = () => {
    setModalState({ visible: false, data: undefined });
  };

  return { modalState, showModal, hideModal };
}
