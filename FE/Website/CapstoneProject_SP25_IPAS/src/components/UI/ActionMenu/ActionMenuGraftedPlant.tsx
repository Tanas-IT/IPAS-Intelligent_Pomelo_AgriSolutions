import { FC } from "react";
import { Icons } from "@/assets";
import ActionMenu from "./ActionMenu/ActionMenu";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants";
import { ActionMenuItem } from "@/types";

interface ActionMenuProps {
  id?: number;
  isCompleted: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onApplyCriteria?: () => void;
  onAddToLot?: () => void;
  onRemoveFromLot?: () => void;
}

const ActionMenuGraftedPlant: FC<ActionMenuProps> = ({
  id,
  isCompleted,
  onEdit,
  onDelete,
  onApplyCriteria,
  onAddToLot,
  onRemoveFromLot,
}) => {
  const navigate = useNavigate();
  const actionItems = [
    id !== undefined
      ? {
          icon: <Icons.eye />,
          label: "View Details",
          onClick: () => navigate(ROUTES.FARM_GRAFTED_PLANT_DETAIL(id)),
        }
      : null,
    !isCompleted && onApplyCriteria
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
    onAddToLot
      ? {
          icon: <Icons.box />,
          label: "Add to Lot",
          onClick: () => onAddToLot?.(),
        }
      : null,
    onRemoveFromLot
      ? {
          icon: <Icons.delete />,
          label: "Remove from Lot",
          onClick: () => onRemoveFromLot?.(), // Gọi hàm xử lý khi nhấn vào
        }
      : null,
  ].filter(Boolean) as ActionMenuItem[];

  return (
    <>
      <ActionMenu title="Grafted Plant Manage" items={actionItems} />
    </>
  );
};

export default ActionMenuGraftedPlant;
