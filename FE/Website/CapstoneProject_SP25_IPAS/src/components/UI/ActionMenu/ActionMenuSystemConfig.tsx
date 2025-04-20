import { FC } from "react";
import { Icons } from "@/assets";
import ActionMenu from "./ActionMenu/ActionMenu";
import { ActionMenuItem } from "@/types";

interface ActionMenuProps {
  deletable: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const ActionMenuSystemConfig: FC<ActionMenuProps> = ({ deletable, onEdit, onDelete }) => {
  const actionItems = [
    {
      icon: <Icons.edit />,
      label: "Update Configuration",
      onClick: () => onEdit(),
    },

    deletable
      ? {
          icon: <Icons.delete />,
          label: "Delete Configuration",
          onClick: () => onDelete(),
        }
      : null,
  ].filter(Boolean) as ActionMenuItem[];

  return (
    <>
      <ActionMenu title="System Configuration Manage" items={actionItems} />
    </>
  );
};

export default ActionMenuSystemConfig;
