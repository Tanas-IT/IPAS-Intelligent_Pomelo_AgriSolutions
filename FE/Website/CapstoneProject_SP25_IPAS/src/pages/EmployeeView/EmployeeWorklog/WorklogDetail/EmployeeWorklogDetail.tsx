import { Badge, Button, Divider, Flex, Image, Tag, Tooltip } from "antd";
import style from "./EmployeeWorklogDetail.module.scss";
import { Icons, Images } from "@/assets";
import { useNavigate, useParams } from "react-router-dom";
import { PATHS } from "@/routes";
import { ToastContainer } from "react-toastify";
import TimelineNotes from "./TimelineNotes/TimelineNotes";
import { useHasChanges, useModal } from "@/hooks";
import { CreateFeedbackRequest } from "@/payloads/feedback";
import { useEffect, useState } from "react";
import FeedbackModal from "./FeedbackModal/FeedbackModal";
import WeatherAlerts from "./WeatherAlerts/WeatherAlerts";
import { worklogService } from "@/services";
import { GetWorklogDetail, GetWorklogNote } from "@/payloads/worklog";
import { formatDate, formatDateW, getUserId } from "@/utils";
import NoteModal from "./TimelineNotes/NoteModal";
import { CustomButton } from "@/components";
import PlanTargetTable from "@/pages/Plan/PlanDetails/PlanTargetTable";
import { PlanTarget, PlanTargetModel } from "@/payloads";

const InfoField = ({
    icon: Icon,
    label,
    value,
    planId,
    processId,
    isTag = false,
    isHarvest = false,
}: {
    icon: React.ElementType;
    label: string;
    value: string | React.ReactNode;
    planId?: number;
    processId?: number;
    isTag?: boolean;
    isHarvest?: boolean;
}) => {
    const navigate = useNavigate();

    const getNavigationPath = () => {
        if (label === "Plan Name") return `/plans/${planId}`;
        if (label === "Process Name") return `/processes/${processId}`;
        return null;
    };

    const path = getNavigationPath();
    const isClickable = path !== null && value !== "None";

    return (
        <Flex className={style.infoField}>
            <Flex className={style.fieldLabelWrapper}>
                <Icon className={style.fieldIcon} />
                <label className={style.fieldLabel}>{label}:</label>
            </Flex>
            <label className={style.fieldValue}>
                {isClickable ? (
                    <span className={style.linkText} onClick={() => navigate(path!)}>
                        {value}
                    </span>
                ) : isTag ? (
                    <Tag color="green">{value}</Tag>
                ) : (
                    value
                )}
            </label>
        </Flex>
    );
};

function EmployeeWorklogDetail() {
    const navigate = useNavigate();
    const formModal = useModal<GetWorklogNote>();
    const cancelConfirmModal = useModal();
    const [feedback, setFeedback] = useState<string>("");
    const [feedbackList, setFeedbackList] = useState<any[]>([]);
    const { id } = useParams();
    const [worklogDetail, setWorklogDetail] = useState<GetWorklogDetail>();
    const [infoFieldsLeft, setInfoFieldsLeft] = useState([
        { label: "Crop", value: "Spring 2025", icon: Icons.growth },
        { label: "Plan Name", value: "Plan name", icon: Icons.box },
        { label: "Growth Stage", value: "Cây non", icon: Icons.plant },
    ]);

    const [infoFieldsRight, setInfoFieldsRight] = useState([
        { label: "Process Name", value: "Caring Process for Pomelo Tree", icon: Icons.process },
        { label: "Type", value: "Watering", icon: Icons.category, isTag: true },
        { label: "Harvest", value: "Harvest", icon: Icons.category, isTag: false, isHarvest: false },
    ]);
    const addModal = useModal<CreateFeedbackRequest>();

    const handleFeedback = () => {
        addModal.showModal();
    };

    const handleAdd = () => {
        // Handle add feedback
    }

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

    useEffect(() => {
        if (!id) {
            navigate("/404");
            return;
        }
        const fetchPlanDetail = async () => {
            try {
                const res = await worklogService.getWorklogDetail(Number(id));
                setWorklogDetail(res);
                setFeedbackList(res.listTaskFeedback || []);

                setInfoFieldsLeft([
                    { label: "Crop", value: res.cropName || "None", icon: Icons.growth },
                    { label: "Plan Name", value: res.planName || "None", icon: Icons.box },
                    {
                        label: "Growth Stage",
                        value: res.listGrowthStageName.join(", ") || "None",
                        icon: Icons.plant,
                    },
                ]);

                setInfoFieldsRight([
                    { label: "Process Name", value: res.processName || "None", icon: Icons.process },
                    {
                        label: "Type",
                        value: res.masterTypeName || "Harvest",
                        icon: Icons.category,
                        isTag: true,
                    },
                    {
                        label: "Harvest",
                        value: res.isHarvest ? "Yes" : "No",
                        icon: Icons.category,
                        isHarvest: res.isHarvest,
                        isTag: false,
                    },
                ]);

                infoFieldsRight[0].value = res.workLogName || "Caring Process for Pomelo Tree";
                infoFieldsRight[1].value = res.status || "Watering";
                // infoFieldsRight[2].value = res.planTargetModels[0]?.plantLotName.join(", ") || "#001";
            } catch (error) {
                console.error("error", error);
                navigate("/error");
            }
        };

        fetchPlanDetail();
    }, [id]);

    return (
        <div className={style.container}>
            <Flex className={style.extraContent}>
                <Tooltip title="Back to calendar">
                    <Icons.back className={style.backIcon} onClick={() => navigate(PATHS.EMPLOYEE.WORK_SCHEDULE)} />
                </Tooltip>
            </Flex>
            <Divider className={style.divider} />
            <Flex className={style.contentSectionTitleLeft}>
                <p className={style.title}>{worklogDetail?.workLogName || "Caring Process"}</p>
                <Tooltip title="Hello">
                    <Icons.tag className={style.iconTag} />
                </Tooltip>
                <Tag className={`${style.statusTag} ${style.normal}`}>{worklogDetail?.status || "Pending"}</Tag>
            </Flex>
            <label className={style.subTitle}>Code: {worklogDetail?.workLogCode || "laggg"}</label>

            {/* Assigned Info */}
            <Flex vertical gap={10} className={style.contentSectionUser}>
                <Flex vertical={false} gap={15}>
                    <Image src={worklogDetail?.reporter[0]?.avatarURL || Images.avatar} width={25} className={style.avt} crossOrigin="anonymous" />
                    <label className={style.createdBy}>{worklogDetail?.assignorName || "laggg"}</label>
                    <label className={style.textCreated}>created this plan</label>
                    <label className={style.createdDate}>{formatDateW(worklogDetail?.date ?? "2")}</label>
                </Flex>
                <Flex vertical gap={10} className={style.info}>
                    <Flex gap={15}>
                        <label className={style.textUpdated}>Assigned To:</label>
                        {worklogDetail?.listEmployee?.map((employee, index) => {
                            const isRejected = employee.statusOfUserWorkLog === "Rejected";
                            const isBeReplaced = employee.statusOfUserWorkLog === "BeReplaced";
                            const borderColor = isRejected ? "red" : isBeReplaced ? "goldenrod" : "none";
                            const textColor = isRejected ? "red" : isBeReplaced ? "goldenrod" : "#bcd379";
                            const tooltipText = isRejected
                                ? "Rejected"
                                : isBeReplaced
                                    ? "Being Replaced"
                                    : "Received";

                            return (
                                <Tooltip key={index} title={tooltipText}>
                                    <Flex align="center">
                                        <Image
                                            src={employee.avatarURL || Images.avatar}
                                            width={25}
                                            className={style.avt}
                                            crossOrigin="anonymous"
                                        />
                                        <label className={style.createdBy} style={{ color: textColor }}>
                                            {employee.fullName || "Unknown"}
                                        </label>
                                    </Flex>
                                </Tooltip>
                            );
                        })}
                    </Flex>

                    <Flex gap={8} align="center" style={{ flexWrap: "wrap", alignItems: "center" }}>
                        <label className={style.textUpdated}>Replacement:</label>
                        {worklogDetail?.replacementEmployee?.length ? (
                            worklogDetail.replacementEmployee.map((e) => (
                                <Tooltip key={e.userId} title={`Replacing: ${e.fullName}`} placement="top">
                                    <div className={style.replacementBadge}>
                                        <Flex align="center" gap={6}>
                                            <Image
                                                src={e.avatar || Images.avatar}
                                                width={25}
                                                className={style.avt}
                                                crossOrigin="anonymous"
                                            />
                                            <span className={style.replacementText}>{e.replaceUserFullName}</span>
                                        </Flex>
                                    </div>
                                </Tooltip>
                            ))
                        ) : (
                            <span className={style.noReplacementText}>No replacement assigned</span>
                        )}
                    </Flex>

                    <Flex gap={15}>
                        <label className={style.textUpdated}>Reporter:</label>
                        <Tooltip
                            title={
                                worklogDetail?.reporter[0]?.statusOfUserWorkLog === "Rejected"
                                    ? "Rejected"
                                    : worklogDetail?.reporter[0]?.statusOfUserWorkLog === "BeReplaced"
                                        ? "Being Replaced"
                                        : "Received"
                            }
                        >
                            <Flex align="center">
                                <Image
                                    src={worklogDetail?.reporter[0]?.avatarURL || Images.avatar}
                                    width={25}
                                    className={style.avt}
                                    crossOrigin="anonymous"
                                />
                                <label
                                    style={{
                                        color:
                                            worklogDetail?.reporter[0]?.statusOfUserWorkLog === "Rejected"
                                                ? "red"
                                                : worklogDetail?.reporter[0]?.statusOfUserWorkLog === "BeReplaced"
                                                    ? "goldenrod"
                                                    : "#bcd379",
                                        fontSize: 16,
                                    }}
                                >
                                    {worklogDetail?.reporter[0]?.fullName || "Alex Johnson"}
                                </label>
                            </Flex>
                        </Tooltip>
                    </Flex>

                    <Divider className={style.divider} />
                    <Flex gap={15}>
                        <label className={style.textUpdated}>Working Time:</label>
                        <label className={style.actualTime}>
                            {worklogDetail?.actualStartTime || "N/A"} - {worklogDetail?.actualEndTime || "N/A"}
                        </label>
                    </Flex>
                    <Flex gap={15}>
                        <label className={style.textUpdated}>Date:</label>
                        <label className={style.actualTime}>
                            {formatDate(worklogDetail?.date || "") || "N/A"}
                        </label>
                    </Flex>
                    <Flex gap={15}>
                        <label className={style.textUpdated}>Start Date Plan:</label>
                        <label className={style.actualTime}>
                            {formatDate(worklogDetail?.startDate || "") || "N/A"}
                        </label>
                    </Flex>
                    <Flex gap={15}>
                        <label className={style.textUpdated}>End Date Plan:</label>
                        <label className={style.actualTime}>
                            {formatDate(worklogDetail?.endDate || "") || "N/A"}
                        </label>
                    </Flex>
                    <Flex gap={15}>
                        <label className={style.textUpdated}>Supplementary Worklog:</label>
                        {worklogDetail?.redoWorkLog && worklogDetail.redoWorkLog.listEmployee.includes(Number(getUserId())) ? (
                            <CustomButton
                                label="View Detail"
                                handleOnClick={() =>
                                    navigate(`/hr-management/worklogs/${worklogDetail?.redoWorkLog.workLogId}`)
                                }
                            />
                        ) : (
                            <label className={style.actualTime}>N/A</label>
                        )}
                    </Flex>
                </Flex>
            </Flex>

            <Divider className={style.divider} />

            {/* Plan Details */}
            <Flex className={style.contentSectionBody}>
                <Flex className={style.col}>
                    {infoFieldsLeft.map((field, index) => (
                        <InfoField
                            key={index}
                            icon={field.icon}
                            label={field.label}
                            value={field.value}
                            planId={worklogDetail?.planId}
                            processId={worklogDetail?.processId}
                        />
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
                            isHarvest={field.label === "Harvest" ? field.isHarvest : false}
                            planId={worklogDetail?.planId}
                            processId={worklogDetail?.processId}
                        />
                    ))}
                </Flex>
            </Flex>

            <Divider className={style.divider} />

            <TimelineNotes
                notes={worklogDetail?.listNoteOfWorkLog || []}
                onAddNote={() => formModal.showModal()}
                currentUserId={Number(getUserId())}
            />

            <Divider className={style.divider} />

            <PlanTargetTable
                data={
                    worklogDetail?.planTargetModels
                        ? transformPlanTargetData(worklogDetail.planTargetModels)
                        : []
                }
            />

            {/* <WeatherAlerts /> */}

            {/* Feedback */}

            <Flex vertical justify="space-between" align="center" className={style.feedbackSection}>
                <Flex vertical style={{ width: "100%" }}>
                    <Divider className={style.divider} />
                    <h4>Feedbacks</h4>
                    <Divider className={style.divider} />
                </Flex>
                {feedbackList.length > 0 ? (
                    <div className={style.feedbackContent}>
                        {feedbackList.map((item, index) => (
                            <div
                                key={index}
                                className={`${style.feedbackItem} ${worklogDetail?.status === "Redo" ? style.redoBackground : ""}`}
                            >
                                <Image
                                    src={item.avatar || "https://via.placeholder.com/40"}
                                    width={40}
                                    height={40}
                                    className={style.avt}
                                    preview={false}
                                />
                                <div className={style.feedbackText}>
                                    <Flex vertical>
                                        <div className={style.feedbackName}>{item.fullName}</div>
                                        <div className={style.feedbackMessage}>{item.content}</div>
                                    </Flex>
                                    {worklogDetail?.status === "Redo"}
                                    <Flex vertical={false}>
                                        <Button className={style.updateButton}>Update</Button>
                                        <Button className={style.deleteButton}>Delete</Button>
                                        {worklogDetail?.status === "Redo" && (
                                            <Button
                                                className={style.reassignButton}
                                                onClick={() => navigate("/hr-management/worklogs")}
                                            >
                                                Re-assign
                                            </Button>
                                        )}
                                    </Flex>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={style.noFeedback}>No feedback yet</div>
                )}
            </Flex>
            <NoteModal
                isOpen={formModal.modalState.visible}
                onClose={formModal.hideModal}
                onSave={handleAdd}
            />
            <ToastContainer />
        </div>
    )
}

export default EmployeeWorklogDetail;