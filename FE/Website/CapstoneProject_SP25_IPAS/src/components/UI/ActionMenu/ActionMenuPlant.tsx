import { FC } from "react";
import { Icons } from "@/assets";
import ActionMenu from "./ActionMenu/ActionMenu";
import { useNavigate } from "react-router-dom";

interface ActionMenuProps {
  id: number;
  onEdit: () => void;
  onDelete: () => void;
}

const ActionMenuPlant: FC<ActionMenuProps> = ({ id, onEdit, onDelete }) => {
  const navigate = useNavigate();
  const actionItems = [
    {
      icon: <Icons.eye />,
      label: "View Plant Details",
      onClick: () => navigate(`/farm/plants/${id}/details`),
    },
    {
      icon: <Icons.edit />,
      label: "Update Plant",
      onClick: () => onEdit(),
    },
    {
      icon: <Icons.delete />,
      label: "Delete Plant",
      onClick: () => onDelete(),
    },
  ];

  return (
    <>
      <ActionMenu title="Plant Manage" items={actionItems} />
    </>
  );
};

export default ActionMenuPlant;
