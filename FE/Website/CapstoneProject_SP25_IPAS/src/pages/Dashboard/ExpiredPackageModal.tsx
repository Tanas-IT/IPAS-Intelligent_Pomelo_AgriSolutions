import { Modal, Button } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes";

const ExpiredPackageModal = () => {
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  const handleRenew = () => {
    navigate(PATHS.PACKAGE.PACKAGE_PURCHASE);
  };

  return (
    <Modal
      title="Farm Subscription Expired"
      open={isVisible}
      footer={null}
      closable={false}
    >
      <p>Your farm's subscription has expired. Please renew your package to continue managing your farm.</p>
      <div style={{ textAlign: "right", marginTop: 16 }}>
        <Button type="primary" onClick={handleRenew}>
          Renew Now
        </Button>
      </div>
    </Modal>
  );
};

export default ExpiredPackageModal;
