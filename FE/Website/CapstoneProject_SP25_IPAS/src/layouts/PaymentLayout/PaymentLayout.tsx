import { useToastFromLocalStorage, useToastMessage } from "@/hooks";
import React, { ReactNode } from "react";

interface PaymentLayoutProps {
  children: ReactNode;
}

const PaymentLayout: React.FC<PaymentLayoutProps> = ({ children }) => {
  useToastMessage();
  useToastFromLocalStorage();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
      }}
    >
      {children}
    </div>
  );
};

export default PaymentLayout;
