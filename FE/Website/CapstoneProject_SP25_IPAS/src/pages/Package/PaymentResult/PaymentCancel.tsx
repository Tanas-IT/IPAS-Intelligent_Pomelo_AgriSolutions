// import { useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { Result, Button } from "antd";
// import styles from "./PaymentCancel.module.scss";
// import { PATHS } from "@/routes";
// import { authService } from "@/services";
// import { LOCAL_STORAGE_KEYS, MESSAGES } from "@/constants";
// import { toast } from "react-toastify";

// const PaymentCancel = () => {
//   const navigate = useNavigate();

//   // useEffect(() => {
//   //   const timer = setTimeout(() => {
//   //     navigate("/");
//   //   }, 5000);

//   //   return () => clearTimeout(timer);
//   // }, [navigate]);
//   const handleBack = async () => {
//       const result = await authService.refreshTokenOutFarm();
//       if (result.statusCode === 200) {
//         localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, result.data.authenModel.accessToken);
//         localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, result.data.authenModel.refreshToken);
//         navigate(PATHS.FARM_PICKER);
//       } else {
//         toast.warning(MESSAGES.ERROR_OCCURRED);
//       }
//     };

//   return (
//     <div className={styles.paymentCancel}>
//       <div className={styles.content}>
//         <Result
//           status="error"
//           title="Payment is cancelled"
//           subTitle="Turn back to home after 5s..."
//           extra={[
//             <Button type="primary" key="home" onClick={handleBack}>
//               Back Home
//             </Button>,
//           ]}
//         />
//       </div>
//     </div>
//   );
// };

// export default PaymentCancel;
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Result, Button, Spin } from "antd";
import styles from "./PaymentCancel.module.scss";
import { PATHS } from "@/routes";
import { authService, paymentService } from "@/services";
import { LOCAL_STORAGE_KEYS, MESSAGES } from "@/constants";
import { toast } from "react-toastify";

const PaymentCancel = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const status = searchParams.get("status");
  const transactionId = searchParams.get("transactionId");

  useEffect(() => {
    const handleCancelPayment = async () => {
      try {
        // 1. Cập nhật trạng thái đơn hàng nếu có orderId
        if (orderId && status === "CANCELLED") {
          const updateResult = await paymentService.handlePayment({
            orderId: Number(orderId),
            status: "CANCELLED",
            transactionId: transactionId || "",
          });
          console.log("Update result:", updateResult);


          if (updateResult.statusCode !== 200) {
            toast.warning("Failed to update order status");
          }
        }

        // 2. Tự động chuyển hướng sau 5 giây
        // const timer = setTimeout(() => {
        //   refreshAndNavigate();
        // }, 5000);

        // return () => clearTimeout(timer);
      } catch (error) {
        console.error("Payment cancellation error:", error);
        toast.warning(MESSAGES.ERROR_OCCURRED);
      }
    };

    handleCancelPayment();
  }, [orderId, status]);

  const refreshAndNavigate = async () => {
    try {
      const result = await authService.refreshTokenOutFarm();
      if (result.statusCode === 200) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, result.data.authenModel.accessToken);
        localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, result.data.authenModel.refreshToken);
        navigate(PATHS.FARM_PICKER);
      } else {
        navigate(PATHS.AUTH.LANDING);
      }
    } catch (error) {
      navigate(PATHS.AUTH.LANDING);
    }
  };

  const handleManualBack = () => {
    refreshAndNavigate();
  };

  return (
    <div className={styles.paymentCancel}>
      <div className={styles.content}>
        <Result
          status="error"
          title="Payment Was Cancelled"
          subTitle={
            orderId
              ? `Order #${orderId} was cancelled. You will be redirected in 5 seconds...`
              : "The payment process was cancelled. You will be redirected in 5 seconds..."
          }

          extra={[
            <Button
              type="primary"
              key="home"
              onClick={handleManualBack}
              loading={!orderId}
            >
              Back Home
            </Button>,
          ]}
        />
      </div>
    </div>
  );
};

export default PaymentCancel;