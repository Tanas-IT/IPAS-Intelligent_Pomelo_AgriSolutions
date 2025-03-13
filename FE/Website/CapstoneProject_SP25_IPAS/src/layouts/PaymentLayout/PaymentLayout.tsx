import React, { ReactNode } from "react";

interface PaymentLayoutProps {
  children: ReactNode;
}

const PaymentLayout: React.FC<PaymentLayoutProps> = ({ children }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      {children}
    </div>
  );
};

export default PaymentLayout;
