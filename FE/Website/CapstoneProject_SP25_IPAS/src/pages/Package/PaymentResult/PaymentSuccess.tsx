import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { Result, Button } from "antd";
import styles from "./PaymentSuccess.module.scss";
import { toast } from "react-toastify";
import { paymentService } from "@/services";
import { handlePaymentRequest } from "@/payloads";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { width, height } = useWindowSize();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const orderId = searchParams.get("orderId");
    const status = searchParams.get("status");
    const transactionId = searchParams.get("transactionId");

    if (!orderId || !transactionId || !status) {
      toast.error("Không tìm thấy thông tin thanh toán!");
      navigate("/");
      return;
    }

    if (status === "PAID") {
      const payload: handlePaymentRequest = {
        transactionId,
        orderId: Number(orderId),
        status
      };

      toast.success("Payment succeeded!");
      
      paymentService.handlePayment(payload).catch((error) => {
        toast.error("Error when payment!");
        console.error("Payment processing error:", error);
      });
    }

    const timer = setTimeout(() => {
      navigate("/dashboard");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate, searchParams]);

  return (
    <div className={styles.container}>
      <Confetti width={width} height={height} />
      <Result
        status="success"
        title="Payment succeeded!"
        subTitle="Thank you for your payment. Your package will expire on June 2, 2025."
        extra={[
          <Button type="primary" key="home" onClick={() => navigate("/")}>
            Back Home
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
