import { FC } from "react";
import { Icons } from "@/assets";
import ActionMenu from "./ActionMenu/ActionMenu";
import { useNavigate } from "react-router-dom";
import { ActionMenuItem } from "@/types";
import { ROUTES } from "@/constants";

interface ActionMenuProps {
  id?: number;
  isPlantDead: boolean;
  noView?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMarkAsDead: () => void;
}

const ActionMenuPlant: FC<ActionMenuProps> = ({
  id,
  isPlantDead,
  noView = false,
  onEdit,
  onDelete,
  onMarkAsDead,
}) => {
  const navigate = useNavigate();
  const actionItems = [
    !noView
      ? {
          icon: <Icons.eye />,
          label: "View Plant Details",
          onClick: () => navigate(ROUTES.FARM_PLANT_DETAIL(id ?? 0)),
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
