import { FC } from "react";
import { Icons } from "@/assets";
import ActionMenu from "./ActionMenu/ActionMenu";

interface ActionMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

const ActionMenuGrowthStage: FC<ActionMenuProps> = ({ onEdit, onDelete }) => {
  const actionItems = [
    {
      icon: <Icons.edit />,
      label: "Update stage",
      onClick: () => onEdit(),
    },
    {
      icon: <Icons.delete />,
      label: "Delete stage",
      onClick: () => onDelete(),
    },
  ];

  return (
    <>
      <ActionMenu title="Growth Stage Manage" items={actionItems} />
    </>
  );
};

export default ActionMenuGrowthStage;
