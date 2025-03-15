import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Result, Button } from "antd";
import styles from "./PaymentCancel.module.scss";
import { PATHS } from "@/routes";
import { authService } from "@/services";
import { LOCAL_STORAGE_KEYS, MESSAGES } from "@/constants";
import { toast } from "react-toastify";

const PaymentCancel = () => {
  const navigate = useNavigate();

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     navigate("/");
  //   }, 5000);

  //   return () => clearTimeout(timer);
  // }, [navigate]);
  const handleBack = async () => {
      const result = await authService.refreshTokenOutFarm();
      if (result.statusCode === 200) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, result.data.authenModel.accessToken);
        localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, result.data.authenModel.refreshToken);
        navigate(PATHS.FARM_PICKER);
      } else {
        toast.error(MESSAGES.ERROR_OCCURRED);
      }
    };

  return (
    <div className={styles.paymentCancel}>
      <div className={styles.content}>
        <Result
          status="error"
          title="Payment is cancelled"
          subTitle="Turn back to home after 5s..."
          extra={[
            <Button type="primary" key="home" onClick={handleBack}>
              Back Home
            </Button>,
          ]}
        />
      </div>
    </div>
  );
};

export default PaymentCancel;
