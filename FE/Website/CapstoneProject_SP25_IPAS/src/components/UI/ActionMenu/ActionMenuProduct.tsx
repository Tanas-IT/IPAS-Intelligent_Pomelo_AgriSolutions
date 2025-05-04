import { FC } from "react";
import { Icons } from "@/assets";
import ActionMenu from "./ActionMenu/ActionMenu";
import { useNavigate } from "react-router-dom";
import { isEmployee } from "@/utils";
import { ROUTES } from "@/constants";
import { ActionMenuItem } from "@/types";

interface ActionMenuProps {
  id?: number;
  onEdit: () => void;
  onDelete: () => void;
  onApplyCriteria: () => void;
}

const ActionMenuProduct: FC<ActionMenuProps> = ({ id, onEdit, onDelete, onApplyCriteria }) => {
  const navigate = useNavigate();
  const isEmployeeIn = isEmployee();
  const actionItems = [
    id !== undefined
      ? {
          icon: <Icons.eye />,
          label: "View Product Details",
          onClick: () => navigate(ROUTES.PRODUCT_DETAIL(id ?? 0)),
        }
      : null,
    !isEmployeeIn
      ? {
          icon: <Icons.edit />,
          label: "Update Product",
          onClick: () => onEdit(),
        }
      : null,
    !isEmployeeIn
      ? {
          icon: <Icons.delete />,
          label: "Delete Product",
          onClick: () => onDelete(),
        }
      : null,
    !isEmployeeIn
      ? {
          icon: <Icons.checkSuccuss />,
          label: "Apply Criteria",
          onClick: () => onApplyCriteria(),
        }
      : null,
  ].filter(Boolean) as ActionMenuItem[];

  return (
    <>
      <ActionMenu title="Product Manage" items={actionItems} />
    </>
  );
};

export default ActionMenuProduct;
