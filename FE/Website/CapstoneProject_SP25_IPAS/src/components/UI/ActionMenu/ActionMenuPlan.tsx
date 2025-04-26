import { FC } from "react";
import { Icons } from "@/assets";
import ActionMenu from "./ActionMenu/ActionMenu";
import { useNavigate } from "react-router-dom";

interface ActionMenuProps {
  id: number;
  //   onEdit: (id: number, user: userUpdate) => void;
    onDelete: () => void;
}

const ActionMenuPlan: FC<ActionMenuProps> = ({ id, onDelete }) => {
  const navigate = useNavigate();
  const handleUpdateClick = async () => {
    navigate(`/plans/update/${id}`);
  };

  const handleDetailClick = async () => {
    navigate(`/plans/${id}`);
  };
  const actionItems = [
    {
      icon: <Icons.detail />,
      label: "View Details",
      onClick: handleDetailClick,
    },
    {
      icon: <Icons.edit />,
      label: "Update Plan",
      onClick: handleUpdateClick,
    },
    {
      icon: <Icons.delete />,
      label: "Delete Plan",
      onClick: () => onDelete(),
    },
  ];

  return (
    <>
      <ActionMenu title="Plan Manage" items={actionItems} />
    </>
  );
};

export default ActionMenuPlan;
