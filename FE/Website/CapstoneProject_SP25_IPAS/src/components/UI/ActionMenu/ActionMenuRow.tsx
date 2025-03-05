import { FC } from "react";
import { Icons } from "@/assets";
import ActionMenu from "./ActionMenu/ActionMenu";
import { useNavigate } from "react-router-dom";

interface ActionMenuProps {
  id: number;
  onViewPlants: () => void;
  onAddPlants: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const ActionMenuRow: FC<ActionMenuProps> = ({
  id,
  onAddPlants,
  onViewPlants,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();
  const actionItems = [
    {
      icon: <Icons.eye />,
      label: "View Plant In Row",
      onClick: () => onViewPlants(),
    },
    // {
    //   icon: <Icons.plant />,
    //   label: "Add Multiple Plants",
    //   onClick: () => onAddPlants(),
    // },
    // {
    //   icon: <Icons.edit />,
    //   label: "Update Row",
    //   onClick: () => onEdit(),
    // },
    // {
    //   icon: <Icons.delete />,
    //   label: "Delete Row",
    //   onClick: () => onDelete(),
    // },
  ];

  return (
    <>
      <ActionMenu title="Plant Manage" items={actionItems} />
    </>
  );
};

export default ActionMenuRow;
