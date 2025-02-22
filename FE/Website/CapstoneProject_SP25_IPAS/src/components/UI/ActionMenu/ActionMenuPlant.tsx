import { FC } from "react";
import { Icons } from "@/assets";
import ActionMenu from "./ActionMenu/ActionMenu";

interface ActionMenuProps {
  id: number;
  //   onEdit: (id: number, user: userUpdate) => void;
  //   onDelete: (id: number) => void;
}

const ActionMenuPlant: FC<ActionMenuProps> = ({ id }) => {
  const handleEditClick = async () => {};
  const actionItems = [
    {
      icon: <Icons.edit />,
      label: "Update Plant",
      onClick: handleEditClick,
    },
    {
      icon: <Icons.delete />,
      label: "Delete Plant",
      onClick: () => {},
    },
  ];

  return (
    <>
      <ActionMenu title="Plant Manage" items={actionItems} />
    </>
  );
};

export default ActionMenuPlant;
