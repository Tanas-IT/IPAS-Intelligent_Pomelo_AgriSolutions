import { FC } from "react";
import { Icons } from "@/assets";
import ActionMenu from "./ActionMenu/ActionMenu";
import { ActionMenuItem } from "@/types";

interface ActionMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

const ActionMenuPackage: FC<ActionMenuProps> = ({ onEdit, onDelete }) => {
  const actionItems = [
    {
      icon: <Icons.edit />,
      label: "Update Package",
      onClick: () => onEdit(),
    },
    {
      icon: <Icons.delete />,
      label: "Delete Package",
      onClick: () => onDelete(),
    },
  ].filter(Boolean) as ActionMenuItem[];

  return (
    <>
      <ActionMenu title="Package Manage" items={actionItems} />
    </>
  );
};

export default ActionMenuPackage;
