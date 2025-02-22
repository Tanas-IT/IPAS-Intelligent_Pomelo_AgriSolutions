import { useState, useEffect } from "react";
import { PATHS } from "@/routes";

const useUnsavedChangesWarning = (isFormDirty: boolean) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isFormDirty) {
        event.preventDefault();
        event.returnValue = "";
        setIsModalVisible(true);
      }
    };

    if (isFormDirty) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isFormDirty]);

  const handleCancelNavigation = () => {
    setIsModalVisible(false);
  };

  const handleConfirmNavigation = () => {
    setIsModalVisible(false);
    window.location.href = PATHS.PLAN.PLAN_LIST;
  };

  return {
    isModalVisible,
    handleCancelNavigation,
    handleConfirmNavigation,
  };
};

export default useUnsavedChangesWarning;
