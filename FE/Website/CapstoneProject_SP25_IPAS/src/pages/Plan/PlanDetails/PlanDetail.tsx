import { PATHS } from "@/routes";
import style from "./PlanDetail.module.scss";
import { Link, useNavigate } from "react-router-dom";
import { Divider, Flex, Image, Tag, Tooltip, Progress, Card } from "antd";
import { Icons, Images } from "@/assets";
import { CustomButton } from "@/components";
import { ToastContainer } from "react-toastify";
import StatusTag from "@/components/UI/StatusTag/StatusTag";

interface GeneralCalendarProps {
    selectedDays: number[];
}

const InfoField = ({
    icon: Icon,
    label,
    value,
    isTag = false,
}: {
    icon: React.ElementType;
    label: string;
    value: string | React.ReactNode;
    isTag?: boolean;
}) => (
    <Flex className={style.infoField}>
        <Flex className={style.fieldLabelWrapper}>
            <Icon className={style.fieldIcon} />
            <label className={style.fieldLabel}>{label}:</label>
        </Flex>
        <label className={style.fieldValue}>
            {isTag ? <Tag color="green">{value}</Tag> : value}
        </label>
    </Flex>
);

function PlanDetail() {
    const navigate = useNavigate();
    const selectedDaysOfMonth = [10, 31];
    const selectedDaysOfWeek = [1, 3, 5];
    const selectedDaysOfNoneType = ["06/02/2025", "16/02/2025"];
    // const frequencyType = "none";
    const frequencyType = "monthly";
    // const frequencyType = "weekly";
    const numOfCompleted = 2;
    const total = 12;

    const infoFieldsLeft = [
        { label: "Crop", value: "Spring 2025", icon: Icons.growth },
        { label: "Plant Lot", value: "Green Pomelo Lot 1", icon: Icons.box },
        { label: "Growth Stage", value: "Cây non", icon: Icons.plant },
    ];

    const infoFieldsRight = [
        { label: "Process Name", value: "Caring Process for Pomelo Tree", icon: Icons.process },
        { label: "Type", value: "Watering", icon: Icons.category, isTag: true },
        { label: "Plant Lot", value: "#001", icon: Icons.lot },
    ];

    const workLogs = [
        { id: 1, task: "Watering in plot 123", type: "Watering", status: "completed", date: "2nd Dec 2024" },
        { id: 2, task: "Fertilizing in plot 123", type: "Fertilizing", status: "pending", date: "5th Dec 2024" },
        { id: 3, task: "Pest Control in plot 123", type: "Pest Control", status: "progress", date: "8th Dec 2024" },
    ];

    const progress = 60;

    const getTaskColors = (taskType: string) => {
        const colors: Record<string, { main: string; light: string }> = {
            Watering: { main: "#1890ff", light: "rgba(24, 144, 255, 0.2)" },
            Fertilizing: { main: "#52c41a", light: "rgba(82, 196, 26, 0.2)" },
            Pruning: { main: "#faad14", light: "rgba(250, 173, 20, 0.2)" },
            "Pest Control": { main: "#f5222d", light: "rgba(245, 34, 45, 0.2)" },
            Default: { main: "#d9d9d9", light: "rgba(217, 217, 217, 0.2)" },
        };
        return colors[taskType] || colors.Default;
    };



    return (
        <div className={style.container}>
            <Flex className={style.extraContent}>
                <Tooltip title="Back to List">
                    <Icons.back className={style.backIcon} onClick={() => navigate(PATHS.PLAN.PLAN_LIST)} />
                </Tooltip>
            </Flex>
            <Divider className={style.divider} />
            <Flex className={style.contentSectionTitleLeft}>
                <p className={style.title}>Caring Process</p>
                <Tooltip title="Hello">
                    <Icons.tag className={style.iconTag} />
                </Tooltip>
                <Tag className={`${style.statusTag} ${style.normal}`}>Pending</Tag>
                <div className={style.addButton}>
                    <CustomButton label="Add Sub Process" icon={<Icons.plus />} />
                </div>
            </Flex>
            <label className={style.subTitle}>Code: laggg</label>

            {/* Assigned Info */}
            <Flex vertical gap={10} className={style.contentSectionUser}>
                <Flex vertical={false} gap={15}>
                    <Image src={Images.avatar} width={25} className={style.avt} />
                    <label className={style.createdBy}>laggg</label>
                    <label className={style.textCreated}>created this plan</label>
                    <label className={style.createdDate}>Sunday, 1st December 2024, 8:30 A.M</label>
                </Flex>
                <Flex gap={15}>
                    <label className={style.textUpdated}>Assigned To:</label>
                    <Image src={Images.avatar} width={25} className={style.avt} />
                </Flex>
                <Flex gap={15}>
                    <label className={style.textUpdated}>Reporter:</label>
                    <Image src={Images.avatar} width={25} className={style.avt} />
                </Flex>
            </Flex>

            <Divider className={style.divider} />

            {/* Plan Progress */}
            <Flex className={style.progressContainer}>
                <label className={style.progressLabel}>Plan Progress:</label>
                <Progress percent={progress} status="active" strokeColor={'#326E2F'} />
            </Flex>

            <Divider className={style.divider} />

            {/* Plan Details */}
            <Flex className={style.contentSectionBody}>
                <Flex className={style.col}>
                    {infoFieldsLeft.map((field, index) => (
                        <InfoField key={index} icon={field.icon} label={field.label} value={field.value} />
                    ))}
                </Flex>
                <Flex className={style.col}>
                    {infoFieldsRight.map((field, index) => (
                        <InfoField
                            key={index}
                            icon={field.icon}
                            label={field.label}
                            value={field.value}
                            isTag={field.isTag}
                        />
                    ))}
                </Flex>
            </Flex>

            <Divider className={style.divider} />

            {/* Frequency Information */}
            <Flex>
                <Flex className={`${style.contentSectionBody} ${style.smallerSection}`}>
                    <Flex className={style.col}>
                        <div className={style.frequencyInfoFields}>
                            <h3 className={style.smallTitle}>Frequency</h3>
                            <p><strong>Date:</strong> 5/2/2025 - 6/2/2025</p>
                            <p><strong>Time:</strong> 07:00 AM - 09:00 AM</p>
                            <p><strong>Type:</strong> <span className={style.valueType}>{frequencyType}</span></p>

                            {frequencyType === "none" && (
                                <ul className={style.dateList}>
                                    {selectedDaysOfNoneType.map((day, index) => (
                                        <li key={index}>{day}</li>
                                    ))}
                                </ul>
                            )}

                            {frequencyType === "weekly" && (
                                <Flex className={style.weekDays}>
                                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                                        <span
                                            key={index}
                                            className={`${style.weekDay} ${selectedDaysOfWeek.includes(index) ? style.active : ""}`}
                                        >
                                            {day}
                                        </span>
                                    ))}
                                </Flex>
                            )}

                            {frequencyType === "monthly" && (
                                <div className={style.monthGrid}>
                                    {[...Array(31)].map((_, index) => {
                                        const day = index + 1;
                                        return (
                                            <span
                                                key={day}
                                                className={`${style.monthDay} ${selectedDaysOfMonth.includes(day) ? style.active : ""}`}
                                            >
                                                {day}
                                            </span>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </Flex>
                </Flex>


                {/* Work Log */}
                <Flex className={style.workLogContainer} gap={15}>
                    <h3>Work Log From Plan <span>{numOfCompleted}/{total}</span></h3>
                    {workLogs.map((log) => (
                        <Card key={log.id} className={style.workLogCard} style={{ backgroundColor: getTaskColors(log.type).light }}>
                            <Flex align="center" justify="space-between">
                                <Flex align="center" gap={8}>
                                    <span className={style.taskDot} style={{ backgroundColor: getTaskColors(log.type).main }} />
                                    <h4>{log.task}</h4>
                                </Flex>
                                <StatusTag status={log.status} />
                            </Flex>
                            <Flex align="center" justify="space-between" className={style.underSection}>
                                <p className={style.workLogDate}>{log.date}</p>
                                <Link to={PATHS.HR.WORKLOG_DETAIL} className={style.link}>View Details</Link>
                            </Flex>

                        </Card>


                    ))}
                </Flex>
            </Flex>

            <ToastContainer />
        </div>
    );
}

export default PlanDetail;
