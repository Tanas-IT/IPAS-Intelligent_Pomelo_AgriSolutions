import { FC } from "react";
import { Icons } from "@/assets";
import ActionMenu from "./ActionMenu/ActionMenu";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants";

interface ActionMenuProps {
  id: number;
  onEdit: () => void;
  onDelete: () => void;
  onApplyCriteria: () => void;
}

const ActionMenuLot: FC<ActionMenuProps> = ({ id, onEdit, onDelete, onApplyCriteria }) => {
  const navigate = useNavigate();
  const actionItems = [
    {
      icon: <Icons.eye />,
      label: "View Details",
      onClick: () => navigate(ROUTES.FARM_PLANT_LOT_DETAIL(id)),
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
