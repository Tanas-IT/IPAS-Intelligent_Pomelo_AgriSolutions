import { FC } from "react";
import { Icons } from "@/assets";
import ActionMenu from "./ActionMenu/ActionMenu";
import { useNavigate } from "react-router-dom";

interface ActionMenuProps {
  id: string;
  //   onEdit: (id: number, user: userUpdate) => void;
  //   onDelete: (id: number) => void;
}

const ActionMenuPlan: FC<ActionMenuProps> = ({ id }) => {
  const navigate = useNavigate();
  const handleUpdateClick = async () => {
    console.log("Edit Clicked");
    navigate(`/plans/update/${id}`);
  };

  const handleDetailClick = async () => {
    console.log("Detail Clicked");
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
      onClick: () => {},
    },
  ];

  return (
    <>
      <ActionMenu title="Plan Manage" items={actionItems} />
    </>
  );
};

export default ActionMenuPlan;
