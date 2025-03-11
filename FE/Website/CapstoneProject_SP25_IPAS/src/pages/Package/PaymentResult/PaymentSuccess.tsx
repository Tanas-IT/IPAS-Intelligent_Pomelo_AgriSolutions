import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { Result, Button } from "antd";
import styles from "./PaymentSuccess.module.scss";
import { toast } from "react-toastify";
import { paymentService } from "@/services";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { width, height } = useWindowSize();
  const [searchParams] = useSearchParams();

  //   useEffect(() => {
  //     const timer = setTimeout(() => {
  //       navigate("/");
  //     }, 5000);

  //     return () => clearTimeout(timer);
  //   }, [navigate]);

  useEffect(() => {
    const orderId = searchParams.get("orderId");
    const status = searchParams.get("status");
    const transactionId = searchParams.get("transactionId");

    if (!orderId || !status) {
      toast.error("Không tìm thấy thông tin thanh toán!");
      navigate("/");
      return;
    }

    if (status === "PAID") {
      toast.success("Thanh toán thành công!");
      // paymentService.updateOrderStatus(orderId, "PAID", transactionId);
    }

    setTimeout(() => {
      navigate("/dashboard"); // Điều hướng về trang chính sau khi xử lý
    }, 3000);
  }, []);

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