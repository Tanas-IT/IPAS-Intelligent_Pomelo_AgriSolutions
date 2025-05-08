import { FC } from "react";
import { Icons } from "@/assets";
import { ActionMenuItem } from "@/types";
import { ActionMenu } from "@/components";

interface ActionMenuWorklogProps {
    worklogId: number;
    onDelete: () => void;
    worklogStatus?: string;
}

const ActionMenuWorklog: FC<ActionMenuWorklogProps> = ({
    worklogId,
    onDelete,
    worklogStatus
}) => {
    const actionItems: ActionMenuItem[] = [
        {
            icon: <Icons.delete />,
            label: "Delete Worklog",
            onClick: onDelete,
            isCloseOnClick: true,
            disabled: worklogStatus !== "Not Started",
        }
    ];

    return (
        <ActionMenu title="Worklog Actions" items={actionItems} />
    );
};

export default ActionMenuWorklog;