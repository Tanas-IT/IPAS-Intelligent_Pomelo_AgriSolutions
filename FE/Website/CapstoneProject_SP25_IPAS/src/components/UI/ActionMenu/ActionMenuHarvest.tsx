import { FC } from "react";
import { Icons } from "@/assets";
import ActionMenu from "./ActionMenu/ActionMenu";

interface ActionMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

const ActionMenuHarvest: FC<ActionMenuProps> = ({ onEdit, onDelete }) => {
  const actionItems = [
    {
      icon: <Icons.edit />,
      label: "Update Harvest",
      onClick: () => onEdit(),
    },
    {
      icon: <Icons.delete />,
      label: "Delete Harvest",
      onClick: () => onDelete(),
    },
  ];

  return (
    <>
      <ActionMenu title="Harvest Manage" items={actionItems} />
    </>
  );
};

export default ActionMenuHarvest;
