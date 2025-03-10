import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWindowSize } from "react-use";
import { Result, Button } from "antd";
import styles from "./PaymentCancel.module.scss";

const PaymentCancel = () => {
  const navigate = useNavigate();
  const { width, height } = useWindowSize();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className={styles.container}>
      <Result
        status="error"
        title="Payment Canceled!"
        subTitle="Redirecting to the homepage..."
        extra={[
          <Button type="primary" key="home" onClick={() => navigate("/")}>
            Về trang chủ ngay
          </Button>,
        ]}
      />
      <div className={styles.fireworks}>
        <div className={styles.firework}></div>
        <div className={styles.firework}></div>
        <div className={styles.firework}></div>
      </div>
    </div>
  );
};

export default PaymentCancel;