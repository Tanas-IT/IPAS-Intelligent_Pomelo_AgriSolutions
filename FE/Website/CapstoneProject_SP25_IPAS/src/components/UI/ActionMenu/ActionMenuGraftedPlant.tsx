import { FC } from "react";
import { Icons } from "@/assets";
import ActionMenu from "./ActionMenu/ActionMenu";
import { useNavigate } from "react-router-dom";
import { GRAFTED_STATUS, ROUTES } from "@/constants";
import { ActionMenuItem } from "@/types";
import { GetGraftedPlant } from "@/payloads";

interface ActionMenuProps {
  graftedPlant: GetGraftedPlant;
  onEdit: () => void;
  onDelete: () => void;
  onApplyCriteria?: () => void;
  onAddToLot: () => void;
  onRemoveFromLot: () => void;
  onMarkAsDead: () => void;
  onConvertToPlant: () => void;
}

const ActionMenuGraftedPlant: FC<ActionMenuProps> = ({
  graftedPlant,
  onEdit,
  onDelete,
  onApplyCriteria,
  onAddToLot,
  onRemoveFromLot,
  onMarkAsDead,
  onConvertToPlant,
}) => {
  const navigate = useNavigate();
  const { graftedPlantId, isCompleted, isDead, plantLotId, status } = graftedPlant;
  const isUsed = status === GRAFTED_STATUS.USED;

  const actionItems = [
    graftedPlantId !== undefined
      ? {
          icon: <Icons.eye />,
          label: "View Details",
          onClick: () => navigate(ROUTES.FARM_GRAFTED_PLANT_DETAIL(graftedPlantId)),
        }
      : null,
    !isCompleted && onApplyCriteria && !isDead
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
    !isDead && !isUsed
      ? {
          icon: <Icons.warning />,
          label: "Mark as Dead",
          onClick: () => onMarkAsDead(),
        }
      : null,
    !isDead && isCompleted && plantLotId === undefined && !isUsed
      ? {
          icon: <Icons.box />,
          label: "Add to Lot",
          onClick: () => onAddToLot(),
        }
      : null,
    plantLotId !== undefined && !isUsed
      ? {
          icon: <Icons.delete />,
          label: "Remove from Lot",
          onClick: () => onRemoveFromLot(),
        }
      : null,
    !isDead && isCompleted && !isUsed && !graftedPlant.plantLotId
      ? {
          icon: <Icons.plant />,
          label: "Convert to Plant",
          onClick: () => onConvertToPlant?.(),
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
