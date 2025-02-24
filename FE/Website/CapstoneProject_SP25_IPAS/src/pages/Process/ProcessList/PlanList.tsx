import { Icons } from "@/assets";
import style from "./ProcessList.module.scss";
import { PlanType } from "@/payloads/process";


type PlanListProps = {
    plans: PlanType[];
    onEdit: (plan: PlanType) => void;
    onDelete: (id: number) => void;
    isEditing: boolean;
}

const PlanList: React.FC<PlanListProps> = ({ plans, onEdit, onDelete, isEditing }) => {
    // console.log("plans", plans);
    
    return (
        <div>
            {plans.map((plan) => (
                <div key={plan.planId} className={style.planItem}>
                    <span>{plan.planName}</span>
                    <div className={`${style.planActions} ${!isEditing ? style.disabled : ""}`}>
                        <Icons.edit color="blue" size={20} onClick={isEditing ? () => onEdit(plan) : undefined} />
                        <Icons.delete color="red" size={20} onClick={isEditing ? () => onDelete(plan.planId) : undefined} />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default PlanList;
