import { useState } from "react";

const useFormManager = () => {
  const [isDirty, setIsDirty] = useState(false);
  const [formData, setFormData] = useState({});

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
  };

  const resetForm = () => {
    setFormData({});
    setIsDirty(false);
  };

  return {
    formData,
    isDirty,
    updateFormData,
    resetForm,
  };
};

export default useFormManager;
