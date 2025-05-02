import { Icons } from "@/assets";
import style from "./ProcessList.module.scss";
import { AIPlanType } from "@/payloads/process/requests";

type AIPlanListProps = {
  plans: AIPlanType[];
  subProcessKey: string;
  onEdit: (plan: AIPlanType, subProcessKey: string) => void;
  onDelete: (planId: number, subProcessKey: string) => void;
  isEditing: boolean;
};

const AIPlanList: React.FC<AIPlanListProps> = ({ plans, subProcessKey, onEdit, onDelete, isEditing }) => {
  const filteredPlans = plans.filter((plan) => plan.planStatus !== "delete");

  return (
    <div className={style.planList}>
      {filteredPlans.length > 0 ? (
        filteredPlans.map((plan) => (
          <div key={plan.planId} className={style.planItem}>
            <div className={style.planInfo}>
              <span className={style.planName}>{plan.planName}</span>
            </div>
            {isEditing && plan.planId !== undefined && (
              <div className={style.planActions}>
                <Icons.edit
                  color="blue"
                  size={20}
                  onClick={() => onEdit(plan, subProcessKey)}
                />
                <Icons.delete
                  color="red"
                  size={20}
                  onClick={() => onDelete(plan.planId, subProcessKey)}
                />
              </div>
            )}
          </div>
        ))
      ) : (
        <p className={style.noPlans}>No plans available for this sub-process.</p>
      )}
    </div>
  );
};

export default AIPlanList;