import { Button, Divider, Flex, Image, Tag, Tooltip } from "antd";
import style from "./WorklogDetail.module.scss";
import { Icons, Images } from "@/assets";
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes";
import { ToastContainer } from "react-toastify";
import TimelineNotes from "./TimelineNotes/TimelineNotes";
import { useModal } from "@/hooks";
import { CreateFeedbackRequest } from "@/payloads/feedback";
import { useState } from "react";
import { ModalForm } from "@/components";
import FeedbackModal from "./FeedbackModal/FeedbackModal";
import WeatherAlerts from "./WeatherAlerts/WeatherAlerts";

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
    const [feedback, setFeedback] = useState<string>("");
    const [feedbackList, setFeedbackList] = useState<any[]>([]);
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
    const addModal = useModal<CreateFeedbackRequest>();

    const handleFeedback = () => {
        addModal.showModal();
    };

    const handleAdd = () => {

    }

    // useEffect(() => {
    //     fetchFeedbacks();
    // }, []);

    // const fetchFeedbacks = async () => {
    //     try {
    //         const feedbacks = await feedbackService.getFeedbacksForWorklog("worklogId");
    //         setFeedbackList(feedbacks);
    //     } catch (error) {
    //         console.error("Error fetching feedbacks:", error);
    //     }
    // };
    return (
        <div className={style.container}>
            <Flex className={style.extraContent}>
                <Tooltip title="Back to calendar">
                    <Icons.back className={style.backIcon} onClick={() => navigate(PATHS.HR.WORKLOG_CALENDAR)} />
                </Tooltip>
            </Flex>
            <Divider className={style.divider} />
            <Flex className={style.contentSectionTitleLeft}>
                <p className={style.title}>Caring Process</p>
                <Tooltip title="Hello">
                    <Icons.tag className={style.iconTag} />
                </Tooltip>
                <Tag className={`${style.statusTag} ${style.normal}`}>Pending</Tag>
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

            <TimelineNotes />

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
                            <div key={index} className={style.feedbackItem}>
                                <Image src={item.avatar} width={25} className={style.avt} />
                                <div>
                                    <div>{item.name}</div>
                                    <div>{item.content}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={style.noFeedback}>Chưa có feedback</div>
                )}
                <Button onClick={handleFeedback} className={style.btnFeedback}>
                    Feedback
                </Button>
            </Flex>

            <FeedbackModal
                isOpen={addModal.modalState.visible}
                onClose={addModal.hideModal}
                onSave={handleAdd}
            />

            <ToastContainer />
        </div>
    )
}

export default WorklogDetail;