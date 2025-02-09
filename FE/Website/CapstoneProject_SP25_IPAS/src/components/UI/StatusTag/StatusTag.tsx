import { Tag } from "antd";
import style from "./StatusTag.module.scss";

const STATUS_COLORS: Record<string, string> = {
    pending: "orange",
    progress: "blue",
    completed: "green",
    overdue: "red",
    cancelled: "gray",
    reviewing: "purple",
    approved: "cyan",
};

interface StatusTagProps {
    status: keyof typeof STATUS_COLORS;
}

const StatusTag: React.FC<StatusTagProps> = ({ status }) => {
    return <Tag color={STATUS_COLORS[status] || "default"} className={style.statusTag}>{status.toUpperCase()}</Tag>;
};

export default StatusTag;
