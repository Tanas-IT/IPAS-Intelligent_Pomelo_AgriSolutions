import { FC } from "react";
import { Icons } from "@/assets";
import ActionMenu from "./ActionMenu/ActionMenu";

interface ActionMenuProps {
  onEdit: () => void;
  onDelete: () => void;
  onApplyCriteria: () => void;
}

const ActionMenuProduct: FC<ActionMenuProps> = ({ onEdit, onDelete, onApplyCriteria }) => {
  const actionItems = [
    {
      icon: <Icons.edit />,
      label: "Update Product",
      onClick: () => onEdit(),
    },
    {
      icon: <Icons.delete />,
      label: "Delete Product",
      onClick: () => onDelete(),
    },
    {
      icon: <Icons.checkSuccuss />,
      label: "Apply Criteria",
      onClick: () => onApplyCriteria(),
    },
  ];

  return (
    <>
      <ActionMenu title="Product Manage" items={actionItems} />
    </>
  );
};

export default ActionMenuProduct;
