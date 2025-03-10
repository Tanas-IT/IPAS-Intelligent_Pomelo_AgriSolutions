import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PaymentSuccess = () => {
    const navigate = useNavigate();

    // useEffect(() => {
    //     setTimeout(() => {
    //         navigate("/");
    //     }, 3000);
    // }, []);

    return <h2>✅ Thanh toán thành công! Đang chuyển hướng...</h2>;
};

export default PaymentSuccess;
