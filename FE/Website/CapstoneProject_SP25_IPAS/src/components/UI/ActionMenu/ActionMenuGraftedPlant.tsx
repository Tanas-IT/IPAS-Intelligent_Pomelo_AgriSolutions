import { FC } from "react";
import { Icons } from "@/assets";
import ActionMenu from "./ActionMenu/ActionMenu";
import { useNavigate } from "react-router-dom";
import { GRAFTED_STATUS, ROUTES } from "@/constants";
import { ActionMenuItem } from "@/types";
import { GetGraftedPlant } from "@/payloads";
import { isEmployee } from "@/utils";

interface ActionMenuProps {
  isDetail?: boolean;
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
  isDetail = false,
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
  const isEmployeeIn = isEmployee();
  const { graftedPlantId, isCompleted, isDead, plantLotId, status } = graftedPlant;
  const isUsed = status === GRAFTED_STATUS.USED;
  const isActive = !isDead && isCompleted && !plantLotId && !isUsed && !isEmployeeIn;

  const actionItems = [
    !isDetail
      ? {
          icon: <Icons.eye />,
          label: "View Details",
          onClick: () => navigate(ROUTES.FARM_GRAFTED_PLANT_DETAIL(graftedPlantId)),
        }
      : null,
    !isCompleted && onApplyCriteria && !isDead && !isEmployeeIn
      ? {
          icon: <Icons.checkSuccuss />,
          label: "Apply Criteria",
          onClick: () => onApplyCriteria?.(),
        }
      : null,
    (isEmployeeIn && !isDead) || !isEmployeeIn
      ? {
          icon: <Icons.edit />,
          label: "Update Grafted Plant",
          onClick: () => onEdit(),
        }
      : null,
    !isEmployeeIn
      ? {
          icon: <Icons.delete />,
          label: "Delete Grafted Plant",
          onClick: () => onDelete(),
        }
      : null,
    !isDead && !isUsed && !isEmployeeIn
      ? {
          icon: <Icons.warning />,
          label: "Mark as Dead",
          onClick: () => onMarkAsDead(),
        }
      : null,
    isActive
      ? {
          icon: <Icons.box />,
          label: "Add to Lot",
          onClick: () => onAddToLot(),
        }
      : null,
    plantLotId && !isUsed && !isEmployeeIn
      ? {
          icon: <Icons.delete />,
          label: "Remove from Lot",
          onClick: () => onRemoveFromLot(),
        }
      : null,
    isActive
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
