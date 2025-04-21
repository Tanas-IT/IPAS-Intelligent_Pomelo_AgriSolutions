import { FC, useState } from "react";
import { Icons } from "@/assets";
import ActionMenu from "./ActionMenu/ActionMenu";
import { Flex, Popover } from "antd";
import { ROLE } from "@/constants";
import style from "./ActionMenu/ActionMenu.module.scss";
import ConfirmModal from "../ConfirmModal/ConfirmModal";
import { GetEmployee, Skill } from "@/payloads";

interface ActionMenuProps {
  employee: GetEmployee;
  onConfirmUpdate: (userId: number, newRole?: string, isActive?: boolean, skills?: Skill[]) => void;
  onEditSkills: () => void;
  onDelete: () => void;
}

const ActionMenuEmployee: FC<ActionMenuProps> = ({
  employee,
  onConfirmUpdate,
  onEditSkills,
  onDelete,
}) => {
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [actionMenuVisible, setActionMenuVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [confirmType, setConfirmType] = useState<"role" | "status" | null>(null);

  const ROLE_OPTIONS = [
    { label: ROLE.EMPLOYEE, value: ROLE.EMPLOYEE },
    { label: ROLE.MANAGER, value: ROLE.MANAGER },
  ];

  const handleRoleSelect = (roleValue: string) => {
    setSelectedRole(roleValue);
    setConfirmType("role");
    setTimeout(() => setPopoverVisible(false), 50);
    setTimeout(() => setActionMenuVisible(false), 100);
    setConfirmVisible(true);
  };

  const handleConfirmUpdate = () => {
    if (confirmType === "role" && selectedRole) {
      onConfirmUpdate(employee.userId, selectedRole);
    } else if (confirmType === "status") {
      onConfirmUpdate(employee.userId, undefined, !employee.isActive);
    }
    setConfirmVisible(false);
  };

  const handleActionMenuVisibleChange = (visible: boolean) => {
    if (!visible) {
      setPopoverVisible(false);
      setTimeout(() => setActionMenuVisible(false), 50);
    } else {
      setActionMenuVisible(visible);
    }
  };

  const roleMenu = (
    <Flex className={style.menuChangeRoleContainer}>
      {ROLE_OPTIONS.map((role) => (
        <div
          key={role.value}
          className={`${style.item} ${employee.roleName === role.value ? style.disabled : ""}`}
          onClick={() => {
            if (employee.roleName !== role.value) handleRoleSelect(role.value);
          }}
        >
          {role.label}
        </div>
      ))}
    </Flex>
  );

  const actionItems = [
    {
      icon: <Icons.users />,
      label: (
        <Popover content={roleMenu} placement="left" open={popoverVisible}>
          <span>Change role</span>
        </Popover>
      ),
      isCloseOnClick: false,
      onClick: () => setPopoverVisible(true),
    },
    {
      icon: <Icons.edit />,
      label: "Edit skills",
      onClick: () => {
        onEditSkills();
        setActionMenuVisible(false);
      },
    },
    {
      icon: employee.isActive ? <Icons.ban /> : <Icons.checkSuccuss />,
      label: employee.isActive ? "De-activate user" : "Activate user",
      onClick: () => {
        setConfirmType("status");
        setConfirmVisible(true);
      },
    },
    {
      icon: <Icons.delete />,
      label: "Delete user",
      onClick: () => onDelete(),
    },
  ];

  return (
    <>
      <ActionMenu
        title="Employee Manage"
        items={actionItems}
        visible={actionMenuVisible}
        setVisible={handleActionMenuVisibleChange}
      />
      <ConfirmModal
        visible={confirmVisible}
        onConfirm={handleConfirmUpdate}
        onCancel={() => setConfirmVisible(false)}
        itemName={confirmType === "role" ? "Role" : "User Status"}
        actionType="update"
        confirmText={
          confirmType === "status" ? (employee.isActive ? "Deactivate" : "Activate") : "Update"
        }
        isDanger={confirmType === "status" && employee.isActive}
      />
    </>
  );
};

export default ActionMenuEmployee;