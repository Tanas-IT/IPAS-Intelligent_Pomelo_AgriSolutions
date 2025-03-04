import { Tag } from "antd";
import style from "./StatusTag.module.scss";

const STATUS_COLORS: Record<string, string> = {
    Pending: "orange",
    InProgress: "blue",
    Completed: "green",
    Overdue: "red",
    Cancelled: "gray",
    Reviewing: "purple",
    Done: "cyan",
};

interface StatusTagProps {
    status: keyof typeof STATUS_COLORS;
}

const StatusTag: React.FC<StatusTagProps> = ({ status }) => {
    return <Tag color={STATUS_COLORS[status] || "default"} className={style.statusTag}>{status.toUpperCase()}</Tag>;
};

export default StatusTag;
