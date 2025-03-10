import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { Result, Button } from "antd";
import styles from "./PaymentSuccess.module.scss";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { width, height } = useWindowSize();

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       navigate("/");
//     }, 5000);

//     return () => clearTimeout(timer);
//   }, [navigate]);

  return (
    <div className={styles.container}>
      <Confetti width={width} height={height} />
      <Result
        status="success"
        title="Payment succeeded!"
        subTitle="Thank you for processing your most recent payment. Your package will expired on June 2, 2025."
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

export default PaymentSuccess;