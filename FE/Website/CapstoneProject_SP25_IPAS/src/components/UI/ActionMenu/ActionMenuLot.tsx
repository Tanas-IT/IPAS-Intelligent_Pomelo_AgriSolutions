import { FC } from "react";
import { Icons } from "@/assets";
import ActionMenu from "./ActionMenu/ActionMenu";

interface ActionMenuProps {
  onEdit: () => void;
  onDelete: () => void;
  onApplyCriteria: () => void;
}

const ActionMenuLot: FC<ActionMenuProps> = ({ onEdit, onDelete, onApplyCriteria }) => {
  const actionItems = [
    {
      icon: <Icons.eye />,
      label: "View Applied Criteria",
      onClick: () => {},
    },
    {
      icon: <Icons.checkSuccuss />,
      label: "Apply Criteria",
      onClick: () => onApplyCriteria(),
    },
    {
      icon: <Icons.edit />,
      label: "Update Lot",
      onClick: () => onEdit(),
    },
    {
      icon: <Icons.delete />,
      label: "Delete Lot",
      onClick: () => onDelete(),
    },
  ];

  return (
    <>
      <ActionMenu title="Plant Lot Manage" items={actionItems} />
    </>
  );
};

export default ActionMenuLot;
