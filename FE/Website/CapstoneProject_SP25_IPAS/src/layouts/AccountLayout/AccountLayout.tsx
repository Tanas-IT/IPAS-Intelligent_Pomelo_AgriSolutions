import { getRoleId } from "@/utils";
import FarmPickerLayout from "../FarmPickerLayout/FarmPickerLayout";
import ManagementLayout from "../ManagementLayout/ManagementLayout";
import { UserRolesStr } from "@/constants";

interface AccountLayoutProps {
  children: React.ReactNode;
}

const AccountLayout: React.FC<AccountLayoutProps> = ({ children }) => {
  const roleId = getRoleId();
  const isUser = roleId === UserRolesStr.User;

  return isUser ? (
    <FarmPickerLayout>{children}</FarmPickerLayout>
  ) : (
    <ManagementLayout>{children}</ManagementLayout>
  );
};

export default AccountLayout;
