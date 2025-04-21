// hooks/useModifyPermission.ts
import { useAuthStore } from "@/store";
import { UserRolesStr } from "@/constants";

const useModifyPermission = (
  recordDate: string,
  recordUserId: number,
  limitDays: number,
  loading: boolean
) => {
  const { userId, roleId } = useAuthStore();
  const isEmployee = roleId === UserRolesStr.Employee;
  const isManagement =
    roleId === UserRolesStr.Manager || roleId === UserRolesStr.Owner;
  const isCreatedByUser = Number(userId) === recordUserId;

  const canEditOrDelete = (() => {
    if (loading || !limitDays) return false;
    const createdDate = new Date(recordDate);
    const now = new Date();
    const diffTime = now.getTime() - createdDate.getTime();
    const diffDays = diffTime / (1000 * 3600 * 24);
    return diffDays <= limitDays;
  })();

  const canEdit =
    (isEmployee && isCreatedByUser && canEditOrDelete) || isManagement;

  return { canEdit, isEmployee, loading };
};

export default useModifyPermission;
