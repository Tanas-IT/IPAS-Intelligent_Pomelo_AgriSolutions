import { Card, Button, Row, Col, Typography, Flex, Tooltip } from "antd";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes";
import { useEffect, useState } from "react";
import { authService, packageService } from "@/services";
import { GetPackage } from "@/payloads/package";
import { ApiResponse } from "@/payloads";
import { PricingCard } from "@/components";
import { Icons } from "@/assets";
import { LOCAL_STORAGE_KEYS, MESSAGES } from "@/constants";
import { toast } from "react-toastify";

const { Title, Text } = Typography;

const PackagePurchase = () => {
  const navigate = useNavigate();
  const [packagee, setPackage] = useState<GetPackage[]>([]);

  const handleSelectPackage = (packageId: number) => {
    // navigate(`${PATHS.PAYMENT}/${packageId}`);
  };

  const handleBack = async () => {
    const result = await authService.refreshTokenOutFarm();
    if (result.statusCode === 200) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN, result.data.authenModel.accessToken);
      localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, result.data.authenModel.refreshToken);
      navigate(PATHS.FARM_PICKER);
    } else {
      toast.warning(MESSAGES.ERROR_OCCURRED);
    }
  };

  useEffect(() => {
    const fetchPackage = async () => {
      const result: ApiResponse<GetPackage[]> = await packageService.getPackagePurchase();
      if (result.statusCode === 200) {
        setPackage(result.data);
      }
    };
    fetchPackage();
  }, []);

  const handleChoosePlan = (packageId: number) => {
    navigate(`${PATHS.PACKAGE.PAYMENT}/${packageId}`);
  };

  return (
    <div style={{ padding: 32, textAlign: "center" }}>
      <Tooltip title="Back">
        <Icons.back
          onClick={handleBack}
          style={{
            position: "absolute",
            left: 70,
            top: 70,
            fontSize: 34,
            cursor: "pointer",
            transition: "color 0.3s ease",
          }}
        />
      </Tooltip>
      <Title level={2}>Choose Your Package</Title>
      {/* <Row gutter={[16, 16]} justify="center"> */}
      <Flex gap={20}>
        {packagee.map((pkg) => (
          <PricingCard
            key={pkg.packageId}
            packageName={pkg.packageName}
            packagePrice={pkg.packagePrice}
            duration={pkg.duration}
            packageDetails={pkg.packageDetails}
            onNavigate={() => handleChoosePlan(pkg.packageId)}
          />
        ))}
      </Flex>
    </div>
  );
};

export default PackagePurchase;
