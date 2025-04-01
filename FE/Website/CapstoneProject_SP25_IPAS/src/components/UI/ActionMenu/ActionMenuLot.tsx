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
}

const ActionMenuLot: FC<ActionMenuProps> = ({
  id,
  isCompleted,
  onEdit,
  onDelete,
  onApplyCriteria,
}) => {
  const navigate = useNavigate();
  const actionItems = [
    id !== undefined
      ? {
          icon: <Icons.eye />,
          label: "View Plant Lot Details",
          onClick: () => navigate(ROUTES.FARM_PLANT_LOT_DETAIL(id)),
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
      label: "Update Plant Lot",
      onClick: () => onEdit(),
    },
    {
      icon: <Icons.delete />,
      label: "Delete Plant Lot",
      onClick: () => onDelete(),
    },
  ].filter(Boolean) as ActionMenuItem[];

  return (
    <>
      <ActionMenu title="Plant Lot Manage" items={actionItems} />
    </>
  );
};

export default ActionMenuLot;
