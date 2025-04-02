import { FC } from "react";
import { Icons } from "@/assets";
import ActionMenu from "./ActionMenu/ActionMenu";
import { useNavigate } from "react-router-dom";
import { ActionMenuItem } from "@/types";
import { ROUTES } from "@/constants";

interface ActionMenuProps {
  id?: number;
  isPlantDead: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onApplyCriteria?: () => void;
  onMarkAsDead: () => void;
}

const ActionMenuPlant: FC<ActionMenuProps> = ({
  id,
  isPlantDead,
  onEdit,
  onDelete,
  onApplyCriteria,
  onMarkAsDead,
}) => {
  const navigate = useNavigate();
  const actionItems = [
    id !== undefined
      ? {
          icon: <Icons.eye />,
          label: "View Plant Details",
          onClick: () => navigate(ROUTES.FARM_PLANT_DETAIL(id ?? 0)),
        }
      : null,
    onApplyCriteria && !isPlantDead
      ? {
          icon: <Icons.checkSuccuss />,
          label: "Apply Criteria",
          onClick: () => onApplyCriteria?.(),
        }
      : null,
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
    !isPlantDead
      ? {
          icon: <Icons.warning />,
          label: "Mark as Dead",
          onClick: () => onMarkAsDead(),
        }
      : null,
  ].filter(Boolean) as ActionMenuItem[];

  return (
    <>
      <ActionMenu title="Plant Manage" items={actionItems} />
    </>
  );
};

export default ActionMenuPlant;
