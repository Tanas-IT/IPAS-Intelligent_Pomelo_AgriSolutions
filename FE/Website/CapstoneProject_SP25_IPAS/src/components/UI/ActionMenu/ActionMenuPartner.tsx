import { FC } from "react";
import { Icons } from "@/assets";
import ActionMenu from "./ActionMenu/ActionMenu";

interface ActionMenuProps {
  onEdit: () => void;
  onDelete: () => void;
}

const ActionMenuPartner: FC<ActionMenuProps> = ({ onEdit, onDelete }) => {
  const actionItems = [
    {
      icon: <Icons.edit />,
      label: "Update partner",
      onClick: () => onEdit(),
    },
    {
      icon: <Icons.delete />,
      label: "Delete partner",
      onClick: () => onDelete(),
    },
  ];

  return (
    <>
      <ActionMenu title="Partner Manage" items={actionItems} />
    </>
  );
};

export default ActionMenuPartner;
