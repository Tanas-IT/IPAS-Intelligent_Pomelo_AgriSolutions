import { PATHS } from "@/routes";
import style from "./PlanDetail.module.scss";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Divider, Flex, Image, Tag, Tooltip, Progress, Card } from "antd";
import { Icons, Images } from "@/assets";
import { CustomButton } from "@/components";
import { ToastContainer } from "react-toastify";
import StatusTag from "@/components/UI/StatusTag/StatusTag";
import { useEffect, useState } from "react";
import { planService } from "@/services";
import { GetPlan } from "@/payloads/plan";
import PlanTargetTable from "./PlanTargetTable";
import { formatDate, formatDateW } from "@/utils";

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
    const { id } = useParams<{ id: string }>();

    const selectedDaysOfMonth = [10, 31];
    const selectedDaysOfWeek = [1, 3, 5];
    const selectedDaysOfNoneType = ["06/02/2025", "16/02/2025"];
    const [frequencyType, setFrequencyType] = useState<string>("none");
    const [processDetail, setProcessDetail] = useState<GetPlan>();
    const numOfCompleted = 2;
    const total = 12;

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

    useEffect(() => {
        if (!id) {
            navigate("/404");
            return;
        }
        const fetchPlanDetail = async () => {
            try {
                const res = await planService.getPlanDetail(id);
                console.log("res", res);

                setProcessDetail(res);
            } catch (error) {
                console.error("error", error);
                navigate("/error");
            }
        };

        fetchPlanDetail();
    }, [id]);

    const infoFieldsLeft = [
        { label: "Crop", value: processDetail?.cropName || "No data", icon: Icons.growth },
        { label: "Growth Stage", value: "Cây non", icon: Icons.plant },
    ];

    const infoFieldsRight = [
        { label: "Process Name", value: "Caring Process for Pomelo Tree", icon: Icons.process },
        { label: "Type", value: "Watering", icon: Icons.category, isTag: true },
    ];

    // const additionalFields = [
    //     { label: "Start Date", value: processDetail?.startDate, icon: Icons.calendar },
    //     { label: "End Date", value: processDetail?.endDate, icon: Icons.calendar },
    //     { label: "Status", value: processDetail?.isActive ? "Active" : "Inactive", icon: Icons.status },
    //     { label: "Notes", value: processDetail?.notes, icon: Icons.detail },
    //     { label: "Plan Detail", value: processDetail?.planDetail, icon: Icons.detail },
    // ];

    const workLogs = [
        { id: 1, task: "Watering in plot 123", type: "Watering", status: "completed", date: "2nd Dec 2024" },
        { id: 2, task: "Fertilizing in plot 123", type: "Fertilizing", status: "pending", date: "5th Dec 2024" },
        { id: 3, task: "Pest Control in plot 123", type: "Pest Control", status: "progress", date: "8th Dec 2024" },
    ];
    console.log(typeof processDetail?.startDate);


    return (
        <div className={style.container}>
            <Flex className={style.extraContent}>
                <Tooltip title="Back to List">
                    <Icons.back className={style.backIcon} onClick={() => navigate(PATHS.PLAN.PLAN_LIST)} />
                </Tooltip>
            </Flex>
            <Divider className={style.divider} />
            <Flex className={style.contentSectionTitleLeft}>
                <p className={style.title}>{processDetail?.planName}</p>
                <Tooltip title="Hello">
                    <Icons.tag className={style.iconTag} />
                </Tooltip>
                <Tag className={`${style.statusTag} ${style.normal}`}>{processDetail?.status}</Tag>
            </Flex>
            <label className={style.subTitle}>Code: {processDetail?.planCode}</label>

            {/* Assigned Info */}
            <Flex vertical gap={10} className={style.contentSectionUser}>
                <Flex vertical={false} gap={15}>
                    <Image src={Images.avatar} width={25} className={style.avt} />
                    <label className={style.createdBy}>{processDetail?.assignorName}</label>
                    <label className={style.textCreated}>created this plan</label>
                    <label className={style.createdDate}>{processDetail?.startDate ? formatDateW(processDetail?.startDate) : ""}</label>
                </Flex>
                <Flex gap={15}>
                    <label className={style.textUpdated}>Assigned To:</label>
                    {processDetail?.listEmployee.map((employee, index) => (
                        <div className={style.containerUser}>
                            <Image src={employee?.avatar} crossOrigin="anonymous" width={27} height={27} className={style.avatar} />
                            <span className={style.name}>{employee?.fullName}</span>
                        </div>
                    ))}

                </Flex>
                <Flex gap={15}>
                    <label className={style.textUpdated}>Reporter:</label>
                    {processDetail?.listReporter.map((report, index) => (
                        <div className={style.containerUser}>
                            <Image src={report?.avatar} crossOrigin="anonymous" width={27} height={27} className={style.avatar} />
                            <span className={style.name}>{report?.fullName}</span>
                        </div>
                    ))}
                </Flex>
            </Flex>

            <Divider className={style.divider} />

            {/* Plan Progress */}
            <Flex className={style.progressContainer}>
                <label className={style.progressLabel}>Plan Progress:</label>
                <Progress percent={processDetail?.progress} status="active" strokeColor={'#20461e'} />
            </Flex>

            <Divider className={style.divider} />

            {/* Plan Details */}
            <div className={style.planDetailContainer}>
                <Flex className={style.infoSection}>
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

                <Flex className={style.infoSection}>
                    <div className={style.dateTime}>
                        <div className={style.field}>
                            <Icons.calendar />
                            <span className={style.label}>Date:</span>
                            <span className={style.value}>
                                {processDetail?.startDate ? formatDate(processDetail?.startDate) : ""} - {processDetail?.endDate ? formatDate(processDetail?.endDate) : ""}
                            </span>
                        </div>

                        <div className={style.field}>
                            <Icons.calendar />
                            <span className={style.label}>Time:</span>
                            <span className={style.value}>
                                {processDetail?.startTime} - {processDetail?.endTime}
                            </span>
                        </div>
                    </div>

                    <div className={style.details}>
                        <div className={style.box}>
                            <span className={style.label}>Plan Detail:</span>
                            <p className={style.value}>{processDetail?.planDetail}</p>
                        </div>

                        <div className={style.box}>
                            <span className={style.label}>Notes:</span>
                            <p className={style.value}>{processDetail?.notes}</p>
                        </div>
                    </div>
                </Flex>


            </div>

            <Divider className={style.divider} />
            <PlanTargetTable
                data={[
                    {
                        type: "Plot",
                        plotNames: ["Plot 1", "Plot 2", "Plot 3"],
                    },
                    {
                        type: "Row",
                        rowNames: ["Row 1", "Row 2", "Row 3"],
                    },
                    {
                        type: "Plant",
                        plantNames: ["Plant 1", "Plant 2", "Plant 3"],
                    },
                    {
                        type: "Plant Lot",
                        plantLotNames: ["Plant Lot 1", "Plant Lot 2", "Plant Lot 3"],
                    },
                    {
                        type: "Grafted Plant",
                        graftedPlantNames: ["Grafted Plant 1", "Grafted Plant 2", "Grafted Plant 3"],
                    },
                ]}
            />
            <Divider className={style.divider} />

            {/* Frequency Information */}
            <Flex>
                <Flex className={`${style.contentSectionBody} ${style.smallerSection}`}>
                    <Flex className={style.col}>
                        <div className={style.frequencyInfoFields}>
                            <h3 className={style.smallTitle}>Frequency</h3>
                            <p><strong>Date:</strong> {processDetail?.startDate ? formatDate(processDetail?.startDate) : ""} - {processDetail?.endDate ? formatDate(processDetail?.endDate) : ""}</p>
                            <p><strong>Time:</strong> {processDetail?.startTime} - {processDetail?.endTime}</p>
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
                    {processDetail?.listWorkLog.map((log) => (
                        <Card key={log.workLogID} className={style.workLogCard}>
                            <Flex align="center" justify="space-between">
                                <Flex align="center" gap={8}>
                                    <span className={style.taskDot} />
                                    <h4>{log.workLogName}</h4>
                                </Flex>
                                <StatusTag status={log.status} />
                            </Flex>
                            <Flex align="center" justify="space-between" className={style.underSection}>
                                <p className={style.workLogDate}>{log.dateWork}</p>
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
