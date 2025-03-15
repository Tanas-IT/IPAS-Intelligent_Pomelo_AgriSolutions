import { Button, Divider, Flex, Image, Tag, Tooltip } from "antd";
import style from "./WorklogDetail.module.scss";
import { Icons, Images } from "@/assets";
import { useNavigate, useParams } from "react-router-dom";
import { PATHS } from "@/routes";
import { ToastContainer } from "react-toastify";
import TimelineNotes from "./TimelineNotes/TimelineNotes";
import { useModal } from "@/hooks";
import { CreateFeedbackRequest, GetFeedback } from "@/payloads/feedback";
import { useEffect, useState } from "react";
import FeedbackModal from "./FeedbackModal/FeedbackModal";
import WeatherAlerts from "./WeatherAlerts/WeatherAlerts";
import { worklogService } from "@/services";
import { GetWorklogDetail, TaskFeedback } from "@/payloads/worklog";
import { formatDateW, getUserId } from "@/utils";
import { getUserById } from "@/services/UserService";
import { GetUser } from "@/payloads";

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

function WorklogDetail() {
    const navigate = useNavigate();
    const formModal = useModal<GetFeedback>();
    const [feedback, setFeedback] = useState<string>("");
    const [manager, setManager] = useState<GetUser | null>(null);
    const [feedbackList, setFeedbackList] = useState<TaskFeedback[]>([]);
    const { id } = useParams();
    const [worklogDetail, setWorklogDetail] = useState<GetWorklogDetail>();
    const [infoFieldsLeft, setInfoFieldsLeft] = useState([
        { label: "Crop", value: "Spring 2025", icon: Icons.growth },
        { label: "Plan Name", value: "Plan name", icon: Icons.box },
        { label: "Growth Stage", value: "Cây non", icon: Icons.plant },
    ]);


    const infoFieldsRight = [
        { label: "Process Name", value: "Caring Process for Pomelo Tree", icon: Icons.process },
        { label: "Type", value: "Watering", icon: Icons.category, isTag: true },
        { label: "Plant Lot", value: "#001", icon: Icons.lot },
    ];
    const addModal = useModal<CreateFeedbackRequest>();

    const handleFeedback = () => {
        addModal.showModal();
    };

    const handleAdd = () => {
        // Handle add feedback
    }

    const fetchPlanDetail = async () => {
        try {
            const res = await worklogService.getWorklogDetail(Number(id));
            console.log("res", res);

            setWorklogDetail(res);
            if (res.listTaskFeedback.length > 0) {
                const users = await getUserById(res.listTaskFeedback[0].managerId);
                console.log("ma", users);
                setManager(users);
            }
            setFeedbackList(res.listTaskFeedback || []);

            setInfoFieldsLeft([
                { label: "Crop", value: res.listGrowthStageName.join(", ") || "Spring 2025", icon: Icons.growth },
                { label: "Plan Name", value: res.workLogName || "Plan name", icon: Icons.box },
                { label: "Growth Stage", value: res.listGrowthStageName.join(", ") || "Cây non", icon: Icons.plant },
            ]);

            infoFieldsRight[0].value = res.workLogName || "Caring Process for Pomelo Tree";
            infoFieldsRight[1].value = res.status || "Watering";
            // infoFieldsRight[2].value = res.planTargetModels[0]?.plantLotName.join(", ") || "#001";
        } catch (error) {
            console.error("error", error);
            navigate("/error");
        }
    };

    useEffect(() => {
        if (!id) {
            navigate("/404");
            return;
        }


        fetchPlanDetail();
    }, [id]);

    return (
        <div className={style.container}>
            <Flex className={style.extraContent}>
                <Tooltip title="Back to calendar">
                    <Icons.back className={style.backIcon} onClick={() => navigate(PATHS.HR.WORKLOG_CALENDAR)} />
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
                    <Image src={worklogDetail?.reporter[0]?.avatar || Images.avatar} width={25} className={style.avt} crossOrigin="anonymous" />
                    <label className={style.createdBy}>{worklogDetail?.reporter[0]?.fullName || "laggg"}</label>
                    <label className={style.textCreated}>created this plan</label>
                    <label className={style.createdDate}>{formatDateW(worklogDetail?.date ?? "2")}</label>
                </Flex>
                <Flex gap={15}>
                    <label className={style.textUpdated}>Assigned To:</label>
                    <Image src={worklogDetail?.listEmployee[0]?.avatar || Images.avatar} width={25} className={style.avt} crossOrigin="anonymous" />
                    <label className={style.createdBy}>{worklogDetail?.listEmployee[0]?.fullName || "Jane Smith"}</label>
                </Flex>
                <Flex gap={15}>
                    <label className={style.textUpdated}>Reporter:</label>
                    <Image src={worklogDetail?.reporter[0]?.avatar || Images.avatar} width={25} className={style.avt} crossOrigin="anonymous" />
                    <label className={style.createdBy}>{worklogDetail?.reporter[0]?.fullName || "Alex Johnson"}</label>
                </Flex>
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

            <TimelineNotes notes={worklogDetail?.listNoteOfWorkLog || []} />

            <Divider className={style.divider} />

            <WeatherAlerts />

            <Divider className={style.divider} />

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
                                    src={manager?.avatarURL || "https://via.placeholder.com/40"}
                                    width={40}
                                    height={40}
                                    className={style.avt}
                                    preview={false}
                                    crossOrigin="anonymous"
                                />
                                <div className={style.feedbackText}>
                                    <Flex vertical>
                                        <div className={style.feedbackName}>{manager?.fullName}</div>
                                        <div className={style.feedbackMessage}>{item.content}</div>
                                    </Flex>
                                    {
                                        worklogDetail?.status === "Redo" && (
                                            <Flex vertical={false}>
                                                <Button className={style.updateButton}>Update</Button>
                                                <Button className={style.deleteButton}>Delete</Button>
                                                <Button
                                                    className={style.reassignButton}
                                                    onClick={() => navigate("/hr-management/worklogs")}
                                                >
                                                    Re-assign
                                                </Button>
                                            </Flex>
                                        )
                                    }

                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={style.noFeedback}>Chưa có feedback</div>
                )}
                {worklogDetail?.status === "Reviewing" ? (
                    <Button onClick={handleFeedback} className={style.btnFeedback}>
                        Feedback
                    </Button>
                ) : worklogDetail?.status !== "Done" ? (
                    <>
                        <Button onClick={handleFeedback} disabled className={style.btnFeedback}>
                            Feedback
                        </Button>
                        <p className={style.informFb}>The employee has not completed the task yet. Please check back later.</p>
                    </>
                ) : null}


            </Flex>
            <FeedbackModal
                isOpen={addModal.modalState.visible}
                onClose={addModal.hideModal}
                onSave={handleAdd}
                worklogId={Number(id)}
                managerId={Number(getUserId())}
                onSuccess={fetchPlanDetail}
                feedbackData={worklogDetail?.listTaskFeedback[0]}
            />
            <ToastContainer />
        </div>
    )
}

export default WorklogDetail;