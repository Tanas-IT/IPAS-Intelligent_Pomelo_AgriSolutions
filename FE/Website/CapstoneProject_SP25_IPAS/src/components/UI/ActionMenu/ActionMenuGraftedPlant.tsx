import { FC } from "react";
import { Icons } from "@/assets";
import ActionMenu from "./ActionMenu/ActionMenu";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants";
import { ActionMenuItem } from "@/types";

interface ActionMenuProps {
  id: number;
  isCompleted: boolean;
  noView?: boolean;
  noCriteria?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onApplyCriteria?: () => void;
}

const ActionMenuGraftedPlant: FC<ActionMenuProps> = ({
  id,
  isCompleted,
  noView = false,
  noCriteria = false,
  onEdit,
  onDelete,
  onApplyCriteria,
}) => {
  const navigate = useNavigate();
  const actionItems = [
    !noView
      ? {
          icon: <Icons.eye />,
          label: "View Details",
          onClick: () => navigate(ROUTES.FARM_GRAFTED_PLANT_DETAIL(id)),
        }
      : null,
    !isCompleted && !noCriteria
      ? {
          icon: <Icons.checkSuccuss />,
          label: "Apply Criteria",
          onClick: () => onApplyCriteria?.(),
        }
      : null,
    {
      icon: <Icons.edit />,
      label: "Update Grafted Plant",
      onClick: () => onEdit(),
    },
    {
      icon: <Icons.delete />,
      label: "Delete Grafted Plant",
      onClick: () => onDelete(),
    },
  ].filter(Boolean) as ActionMenuItem[];

  return (
    <>
      <ActionMenu title="Grafted Plant Manage" items={actionItems} />
    </>
  );
};

export default ActionMenuGraftedPlant;
