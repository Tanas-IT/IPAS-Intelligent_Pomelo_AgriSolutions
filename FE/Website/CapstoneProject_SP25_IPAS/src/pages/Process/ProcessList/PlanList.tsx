import { Icons } from "@/assets";
import style from "./ProcessList.module.scss";
import { PlanType } from "@/payloads/process";

type PlanListProps = {
  plans: PlanType[];
  onEdit: (plan: PlanType) => void;
  onDelete: (id: number) => void;
  isEditing: boolean;
};

const PlanList: React.FC<PlanListProps> = ({ plans, onEdit, onDelete, isEditing }) => {
  
  const filteredPlans = plans.filter((plan) => plan.planStatus !== "delete");
  return (
    <div>
      {filteredPlans.map((plan) => (
        <div key={plan.planId} className={style.planItem}>
          <span>{plan.planName}</span>
          {isEditing && (
            <div className={style.planActions}>
              <Icons.edit color="blue" size={20} onClick={() => onEdit(plan)} />
              <Icons.delete color="red" size={20} onClick={() => onDelete(plan.planId)} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PlanList;
