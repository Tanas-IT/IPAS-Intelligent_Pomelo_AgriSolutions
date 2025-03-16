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
import { GetPlan, PlanTargetModel } from "@/payloads/plan";
import PlanTargetTable from "./PlanTargetTable";
import { formatDate, formatDateW } from "@/utils";

interface GeneralCalendarProps {
    selectedDays: number[];
}

interface PlanTarget {
    type: "Plot" | "Row" | "Plant" | "Plant Lot" | "Grafted Plant";
    plotNames?: string[];
    rowNames?: string[];
    plantNames?: string[];
    plantLotNames?: string[];
    graftedPlantNames?: string[];
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
    const [planDetail, setPlanDetail] = useState<GetPlan>();
    const numOfCompleted = planDetail?.listWorkLog.filter((p) => p.status === "Done").length ?? 0;
    const total = planDetail?.listWorkLog.length;

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

                setPlanDetail(res);
            } catch (error) {
                console.error("error", error);
                navigate("/error");
            }
        };

        fetchPlanDetail();
    }, [id]);

    const infoFieldsLeft = [
        { label: "Crop", value: planDetail?.cropName || "No data", icon: Icons.growth },
        { label: "Growth Stage", value: "Cây non", icon: Icons.plant },
    ];

    const infoFieldsRight = [
        { label: "Process Name", value: "Caring Process for Pomelo Tree", icon: Icons.process },
        { label: "Type", value: "Watering", icon: Icons.category, isTag: true },
    ];

    const workLogs = [
        { id: 1, task: "Watering in plot 123", type: "Watering", status: "completed", date: "2nd Dec 2024" },
        { id: 2, task: "Fertilizing in plot 123", type: "Fertilizing", status: "pending", date: "5th Dec 2024" },
        { id: 3, task: "Pest Control in plot 123", type: "Pest Control", status: "progress", date: "8th Dec 2024" },
    ];
    console.log(typeof planDetail?.startDate);

    const determineUnit = (planTargetModels: PlanTargetModel) => {
        const { rows, plants, landPlotName, graftedPlants, plantLots } = planTargetModels;
      
        if (rows && rows.length > 0) {
          return "Row";
        }
        if (plants && plants.length > 0) {
          return "Plant";
        }
        if (graftedPlants && graftedPlants.length > 0) {
          return "Grafted Plant";
        }
        if (plantLots && plantLots.length > 0) {
          return "Plant Lot";
        }
        if (landPlotName) {
          return "Plot";
        }
        return "Unknown";
      };

      const transformPlanTargetData = (planTargetModels: PlanTargetModel[]): PlanTarget[] => {
        return planTargetModels.flatMap((model) => {
            const { rows, landPlotName, graftedPlants, plantLots, plants } = model;
            const unit = determineUnit(model);
            const data: PlanTarget[] = [];
    
            switch (unit) {
                case "Row":
                    if (rows && rows.length > 0) {
                        const rowNames = rows.map((row) => `Row ${row.rowIndex}`);
                        const plantNames = rows.flatMap((row) => row.plants.map((plant) => plant.plantName));
                        data.push({
                            type: "Row",
                            plotNames: landPlotName ? [landPlotName] : undefined,
                            rowNames: rowNames.length > 0 ? rowNames : undefined,
                            plantNames: plantNames.length > 0 ? plantNames : undefined,
                        });
                    }
                    break;
    
                case "Plant":
                    if (plants && plants.length > 0) {
                        data.push({
                            type: "Plant",
                            plotNames: landPlotName ? [landPlotName] : undefined,
                            plantNames: plants.map((plant) => plant.plantName),
                        });
                    }
                    break;
    
                case "Grafted Plant":
                    if (graftedPlants && graftedPlants.length > 0) {
                        data.push({
                            type: "Grafted Plant",
                            plotNames: landPlotName ? [landPlotName] : undefined,
                            graftedPlantNames: graftedPlants.map((plant) => plant.name),
                        });
                    }
                    break;
    
                case "Plant Lot":
                    if (plantLots && plantLots.length > 0) {
                        data.push({
                            type: "Plant Lot",
                            plotNames: landPlotName ? [landPlotName] : undefined,
                            plantLotNames: plantLots.map((lot) => lot.name),
                        });
                    }
                    break;
    
                case "Plot":
                    if (landPlotName) {
                        data.push({
                            type: "Plot",
                            plotNames: [landPlotName],
                        });
                    }
                    break;
    
                default:
                    break;
            }
    
            return data;
        });
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
                <p className={style.title}>{planDetail?.planName}</p>
                <Tooltip title="Hello">
                    <Icons.tag className={style.iconTag} />
                </Tooltip>
                <Tag className={`${style.statusTag} ${style.normal}`}>{planDetail?.status}</Tag>
            </Flex>
            <label className={style.subTitle}>Code: {planDetail?.planCode}</label>

            {/* Assigned Info */}
            <Flex vertical gap={10} className={style.contentSectionUser}>
                <Flex vertical={false} gap={15}>
                    <Image src={Images.avatar} width={25} className={style.avt} />
                    <label className={style.createdBy}>{planDetail?.assignorName}</label>
                    <label className={style.textCreated}>created this plan</label>
                    <label className={style.createdDate}>{planDetail?.startDate ? formatDateW(planDetail?.startDate) : ""}</label>
                </Flex>
                <Flex gap={15}>
                    <label className={style.textUpdated}>Assigned To:</label>
                    {planDetail?.listEmployee.map((employee, index) => (
                        <div className={style.containerUser}>
                            <Image src={employee?.avatarURL} crossOrigin="anonymous" width={27} height={27} className={style.avatar} />
                            <span className={style.name}>{employee?.fullName}</span>
                        </div>
                    ))}

                </Flex>
                <Flex gap={15}>
                    <label className={style.textUpdated}>Reporter:</label>
                    {planDetail?.listReporter.map((report, index) => (
                        <div className={style.containerUser}>
                            <Image src={report?.avatarURL} crossOrigin="anonymous" width={27} height={27} className={style.avatar} />
                            <span className={style.name}>{report?.fullName}</span>
                        </div>
                    ))}
                </Flex>
            </Flex>

            <Divider className={style.divider} />

            {/* Plan Progress */}
            <Flex className={style.progressContainer}>
                <label className={style.progressLabel}>Plan Progress:</label>
                <Progress percent={planDetail?.progress} status="active" strokeColor={'#20461e'} />
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
                                {planDetail?.startDate ? formatDate(planDetail?.startDate) : ""} - {planDetail?.endDate ? formatDate(planDetail?.endDate) : ""}
                            </span>
                        </div>

                        <div className={style.field}>
                            <Icons.calendar />
                            <span className={style.label}>Time:</span>
                            <span className={style.value}>
                                {planDetail?.startTime} - {planDetail?.endTime}
                            </span>
                        </div>
                    </div>

                    <div className={style.details}>
                        <div className={style.box}>
                            <span className={style.label}>Plan Detail:</span>
                            <p className={style.value}>{planDetail?.planDetail}</p>
                        </div>

                        <div className={style.box}>
                            <span className={style.label}>Notes:</span>
                            <p className={style.value}>{planDetail?.notes}</p>
                        </div>
                    </div>
                </Flex>


            </div>

            <Divider className={style.divider} />
            <PlanTargetTable
                data={planDetail?.planTargetModels ? transformPlanTargetData(planDetail.planTargetModels) : []}
            />
            <Divider className={style.divider} />

            {/* Frequency Information */}
            <Flex>
                <Flex className={`${style.contentSectionBody} ${style.smallerSection}`}>
                    <Flex className={style.col}>
                        <div className={style.frequencyInfoFields}>
                            <h3 className={style.smallTitle}>Frequency</h3>
                            <p><strong>Date:</strong> {planDetail?.startDate ? formatDate(planDetail?.startDate) : ""} - {planDetail?.endDate ? formatDate(planDetail?.endDate) : ""}</p>
                            <p><strong>Time:</strong> {planDetail?.startTime} - {planDetail?.endTime}</p>
                            <p><strong>Type:</strong> <span className={style.valueType}>{planDetail?.frequency}</span></p>

                            {frequencyType === "none" && (
                                <ul className={style.dateList}>
                                    {JSON.parse(planDetail?.customDates || "[]").map((day: string, index: number) => (
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
                    {planDetail?.listWorkLog.map((log) => (
                        <Card key={log.workLogID} className={style.workLogCard}>
                            <Flex align="center" justify="space-between">
                                <Flex align="center" gap={8}>
                                    <span className={style.taskDot} />
                                    <h4>{log.workLogName}</h4>
                                </Flex>
                                <StatusTag status={log.status} />
                            </Flex>
                            <Flex align="center" justify="space-between" className={style.underSection}>
                                <p className={style.workLogDate}>{formatDateW(log.dateWork)}</p>
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
