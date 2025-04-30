import { LOCAL_STORAGE_KEYS } from "@/constants";
import { useEffect } from "react";
import { toast } from "react-toastify";

const useToastFromLocalStorage = () => {
  useEffect(() => {
    // Đọc thông điệp từ localStorage
    const message = localStorage.getItem(LOCAL_STORAGE_KEYS.ERROR_MESSAGE);

    if (message) {
      // Hiển thị toast nếu có thông điệp
      toast.warning(message);
      // Sau khi hiển thị, xóa thông điệp khỏi localStorage
      localStorage.removeItem(LOCAL_STORAGE_KEYS.ERROR_MESSAGE);
    }
  }, []);
};

export default useToastFromLocalStorage;
