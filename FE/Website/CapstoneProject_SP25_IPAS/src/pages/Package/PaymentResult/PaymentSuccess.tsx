import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { Result, Button, Card } from "antd";
import styles from "./PaymentSuccess.module.scss";
import { toast } from "react-toastify";
import { paymentService } from "@/services";
import { ApiResponse, handlePaymentRequest } from "@/payloads";
import { useFarmStore } from "@/stores";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const { width, height } = useWindowSize();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const processPayment = async () => {
      const orderId = searchParams.get("orderId");
      const status = searchParams.get("status");
      const transactionId = searchParams.get("transactionId");
  
      if (!orderId || !transactionId || !status) {
        toast.warning("Not found payment information!");
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
        console.log("payload handle payment", payload);
  
        try {
          const result = await paymentService.handlePayment(payload);
          console.log("resulttttt", result);
          if (result?.data.expiredDate) {
            useFarmStore.setState({ farmExpiredDate: result.data.expiredDate });
          }
        } catch (error) {
          toast.warning("Error when payment!");
          console.error("Payment processing error:", error);
        }
      }
    };
  
    processPayment();
  }, [navigate, searchParams]);
  

  return (
    <div className={styles.container}>
      <Confetti width={width} height={height} />
      <Card className={styles.card}>
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
      </Card>
      <div className={styles.fireworks}>
        <div className={styles.firework}></div>
        <div className={styles.firework}></div>
        <div className={styles.firework}></div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
