import { Card, Button, Row, Col, Typography, Flex } from "antd";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes";
import { useEffect, useState } from "react";
import { packageService } from "@/services";
import { GetPackage } from "@/payloads/package";
import { ApiResponse } from "@/payloads";
import { PricingCard } from "@/components";

const { Title, Text } = Typography;

const PackagePurchase = () => {
    const navigate = useNavigate();
    const [packagee, setPackage] = useState<GetPackage[]>([]);

    const handleSelectPackage = (packageId: number) => {
        // navigate(`${PATHS.PAYMENT}/${packageId}`);
    };

    useEffect(() => {
        const fetchPackage = async () => {
            const result: ApiResponse<GetPackage[]> = await packageService.getPackagePurchase();
            if (result.statusCode === 200) {
                console.log("fetch thanh con");
                
                setPackage(result.data);
            }
        }
        fetchPackage();

    }, []);

    const handleChoosePlan = (packageId: number) => {
        navigate(`${PATHS.PACKAGE.PAYMENT}/${packageId}`);
    }

    return (
        <div style={{ padding: 32, textAlign: "center" }}>
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
