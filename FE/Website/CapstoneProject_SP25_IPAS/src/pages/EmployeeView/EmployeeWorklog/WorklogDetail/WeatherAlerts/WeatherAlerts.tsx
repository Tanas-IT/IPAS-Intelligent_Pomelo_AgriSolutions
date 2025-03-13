import { useState } from "react";
import { Alert, Button, Flex, Modal, Select, DatePicker, Input, Image } from "antd";
import { AlertProps } from "antd/es/alert";
import style from "./WeatherAlerts.module.scss";
import { Images } from "@/assets";

interface WeatherAlert {
    id: number;
    type: AlertProps["type"];
    message: string;
    color: string;
}

const WeatherAlerts: React.FC = () => {
    const [alerts, setAlerts] = useState<WeatherAlert[]>([
        { id: 1, type: "error", message: "Mưa lớn có thể ảnh hưởng đến việc tưới cây", color: "red" },
        { id: 2, type: "warning", message: "Dự báo có gió mạnh, cần kiểm tra cây trồng", color: "orange" },
    ]);

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedAlert, setSelectedAlert] = useState<WeatherAlert | null>(null);

    const showRescheduleModal = (alert: WeatherAlert) => {
        setSelectedAlert(alert);
        setIsModalOpen(true);
    };

    const handleDelete = (id: number) => {
        setAlerts(alerts.filter((alert) => alert.id !== id));
    };

    return (
        <div className={style.alertContainer}>
            <Flex gap={15} className={style.title} >
            <Image src={Images.weatherImg} width={25}/>
            <h4 className={style.alertTitle}>Cảnh Báo Thời Tiết</h4>
            </Flex>
            {alerts.length > 0 ? (
                alerts.map((alert) => (
                    <Alert
                        key={alert.id}
                        message={alert.message}
                        type={alert.type}
                        showIcon
                        className={style.alert}
                        style={{ borderLeft: `5px solid ${alert.color}` }}
                        action={
                            <Flex gap={10}>
                                <Button size="small" onClick={() => showRescheduleModal(alert)}>
                                    Điều chỉnh lịch
                                </Button>
                                <Button size="small" danger onClick={() => handleDelete(alert.id)}>
                                    Xóa
                                </Button>
                            </Flex>
                        }
                    />
                ))
            ) : (
                <p className={style.noAlert}>Không có cảnh báo nào.</p>
            )}

            <Modal
                title="Điều chỉnh lịch"
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={() => setIsModalOpen(false)}
            >
                <Flex vertical gap={10}>
                    <label>Chọn ngày mới:</label>
                    <DatePicker style={{ width: "100%" }} />

                    <label>Lý do điều chỉnh:</label>
                    <Input placeholder="Nhập lý do" />

                    <label>Chọn nhân viên:</label>
                    <Select
                        placeholder="Chọn nhân viên"
                        options={[
                            { value: "1", label: "Nguyễn Văn A" },
                            { value: "2", label: "Trần Thị B" },
                        ]}
                        style={{ width: "100%" }}
                    />
                </Flex>
            </Modal>
        </div>
    );
};

export default WeatherAlerts;
