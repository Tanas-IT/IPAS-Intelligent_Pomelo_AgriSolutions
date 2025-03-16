import { FC } from "react";
import { Icons } from "@/assets";
import ActionMenu from "./ActionMenu/ActionMenu";

interface ActionMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

const ActionMenuCriteria: FC<ActionMenuProps> = ({ onEdit, onDelete }) => {
  const actionItems = [
    {
      icon: <Icons.edit />,
      label: "Update criteria",
      onClick: () => onEdit(),
    },
    {
      icon: <Icons.delete />,
      label: "Delete criteria",
      onClick: () => onDelete(),
    },
  ];

  return (
    <>
      <ActionMenu title="Criteria Manage" items={actionItems} />
    </>
  );
};

export default ActionMenuCriteria;
