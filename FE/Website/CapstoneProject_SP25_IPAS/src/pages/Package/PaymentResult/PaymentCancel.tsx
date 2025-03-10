import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PaymentCancel = () => {
    const navigate = useNavigate();

    // useEffect(() => {
    //     setTimeout(() => {
    //         navigate("/");
    //     }, 3000);
    // }, []);

    return <h2>❌ Thanh toán bị hủy. Đang chuyển hướng...</h2>;
};

export default PaymentCancel;
