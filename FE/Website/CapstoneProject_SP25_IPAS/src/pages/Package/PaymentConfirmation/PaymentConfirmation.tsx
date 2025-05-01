import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Button, Steps, Divider, Spin } from 'antd';
import { CheckCircleTwoTone, CreditCardOutlined } from '@ant-design/icons';
import style from './PaymentConfirmation.module.scss';
import { packageService, paymentService } from '@/services';
import { GetPackage } from '@/payloads/package';
import { PATHS } from '@/routes';
import { ApiResponse, CreateOrderResponse, PayOSPaymentRequest, PayOSPaymentResponse } from '@/payloads';
import { formatCurrencyVND, getFarmId } from '@/utils';
import { toast } from 'react-toastify';

const { Title, Text } = Typography;

function PaymentConfirmation()  {
    const { packageId } = useParams<{ packageId: string }>();
    const navigate = useNavigate();
    const [packageDetails, setPackageDetails] = useState<GetPackage | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchPackageDetails = async () => {
            if (packageId) {
                const result = await packageService.getPackageById(Number(packageId));
                if (result.statusCode === 200) {
                    setPackageDetails(result.data);
                } else {
                    console.error("Failed to fetch package details:", result.message);
                }
                setLoading(false);
            }
        };

        fetchPackageDetails();
    }, [packageId]);

    // const handleConfirmPayment = async () => {
    //     if (!packageDetails) return;
    
    //     try {
    //         const result: ApiResponse<PayOSPaymentResponse> = await paymentService.createPaymentLink({
    //             packageId: packageDetails.packageId,
    //             amount: packageDetails.packagePrice,
    //             description: `Payment for ${packageDetails.packageName}`,
    //             farmId: Number(getFarmId())
    //         });
    //         console.log("result", result);
            
    
    //         if (result.statusCode === 200 && result.data.checkoutUrl) {
    //             window.location.href = result.data.checkoutUrl;
    //         } else {
    //             toast.warning(result.message);
    //             console.error("Failed to create payment link:", result.message);
    //         }
    //     } catch (error) {
    //         console.error("Payment error:", error);
    //     }
    // };

    const handleConfirmPayment = async () => {
        if (!packageDetails) return;
    
        try {
            const result: ApiResponse<CreateOrderResponse> = await paymentService.createOrder({
                packageId: packageDetails.packageId,
                totalPrice: packageDetails.packagePrice,
                notes: `Payment for ${packageDetails.packageName}`,
                farmId: Number(getFarmId()),
                orderName: `Order for ${packageDetails.packageName}`,
                paymentMethod: "PAYOS",
                paymentStatus: "PENDING"
            });
            console.log("result", result);
            
    
            if (result.statusCode === 200 && result.data.orderId) {
                const link: ApiResponse<PayOSPaymentResponse> = await paymentService.createPaymentLink({
                    orderId: result.data.orderId
                })
                console.log("link", link);
                
                if(link.statusCode === 200) {
                    window.location.href = link.data.checkoutUrl;
                }
            } else {
                toast.warning(result.message);
                console.error("Failed to create payment link:", result.message);
            }
        } catch (error) {
            console.error("Payment error:", error);
        }
    };
    const handleCancel = () => {
        navigate(PATHS.PACKAGE.PACKAGE_PURCHASE);
    };

    if (loading) {
        return <Spin size='small'/>;
    }

    if (!packageDetails) {
        return <p>Somethings wrong...</p>;
    }

    return (
        <div className={style.paymentContainer}>
            <Card className={style.paymentCard}>
                <div className={style.header}>
                    <Title level={2} className={style.title}>
                        Payment Confirmation
                    </Title>
                    <Text className={style.subtitle}>
                        Please review your package details before proceeding to payment.
                    </Text>
                </div>

                <Steps
                    current={1}
                    items={[
                        { title: 'Select Plan', icon: <CheckCircleTwoTone twoToneColor="#52c41a" /> },
                        { title: 'Confirm Payment', icon: <CreditCardOutlined /> },
                        { title: 'Complete' },
                    ]}
                    className={style.steps}
                />

                <Divider className={style.divider} />

                <div className={style.packageDetails}>
                    <Title level={4} className={style.packageName}>
                        {packageDetails.packageName}
                    </Title>
                    <div className={style.details}>
                        <Text className={style.label}>Price:</Text>
                        <Text className={style.valuePrice}>{formatCurrencyVND(packageDetails.packagePrice)}</Text>
                    </div>
                    <div className={style.details}>
                        <Text className={style.label}>Duration:</Text>
                        <Text className={style.value}>{packageDetails.duration} days</Text>
                    </div>
                </div>

                <Divider className={style.divider} />

                <div className={style.buttonGroup}>
                    <Button type="primary" size="large" onClick={handleConfirmPayment} className={style.confirmButton}>
                        Proceed to Payment
                    </Button>
                    <Button type="default" size="large" onClick={handleCancel} className={style.cancelButton}>
                        Cancel
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default PaymentConfirmation;