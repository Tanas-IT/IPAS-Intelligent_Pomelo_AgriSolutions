import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const useToastMessage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!location.state) return;

    const { toastMessage, warningMessage } = location.state;

    if (toastMessage) {
      toast.success(toastMessage, { autoClose: 2500 });
    } else if (warningMessage) {
      toast.error(warningMessage, { autoClose: 2500 });
    }

    // Chỉ gọi navigate nếu location.state không rỗng
    if (toastMessage || warningMessage) {
      setTimeout(() => {
        navigate(location.pathname, { replace: true, state: {} });
      }, 100); // Delay nhỏ để tránh lỗi throttle
    }
  }, [location, navigate]);
};

export default useToastMessage;
