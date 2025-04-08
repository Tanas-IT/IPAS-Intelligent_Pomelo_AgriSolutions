using CloudinaryDotNet;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Common.Constants
{
    public class SystemConfigConst
    {
        #region CONFIG GROUP NAME
        public const string VALIDATION_VARIABLE = "Validation Variable";
        public const string MASTER_TYPE = "Master Type";
        public const string CRITERIA_APPLY = "Criteria Apply";
        public const string WORKLOG = "WorkLog";
        public const string AI = "AI";
        #endregion

        #region CONFIG FOR PLANT IN GRAFTED
        public const string GROWTH_EXPONENT = "GrowthExponent";
        public const string INITIAL_BRANCHING_COEFFICIENT = "InitialBranchingCoefficient";
        public const string MAXIMUM_GRAFTING_LIMIT = "MaximumGraftingLimit";
        #endregion

        #region CONFIG MASTER TYPE
        // Target for work
        public const string WORK_TARGET = "WorkType";
        // Target for criteria
        public const string CRITERIA_TARGET = "CriteriaType";
        #endregion

        #region CONFIG CRITERIA APPLY FOR OBJECTS
        #region PLANT LOT
        public const string PLANT_LOT_CRITERIA = "PlantLotCriteria";  // Lấy tất cả các tiêu chí được sử dụng trong plant lot
        public const string PLANT_LOT_CONDITION_APPLY = "PlantLotConditionApply"; // Các tiêu chí sử dụng trong condition check
        public const string PLANT_LOT_EVALUATION_APPLY = "PlantLotEvaluationApply"; // Các tiêu chí sử dụng trong evaluation check
        #endregion

        #region GRAFTED
        public const string GRAFTED_CRITERIA = "GraftedCriteria"; // Lấy tất cả các tiêu chí được sử dụng trong plant lot
        public const string GRAFTED_CONDITION_APPLY = "GraftedConditionApply"; // Lấy tất cả các tiêu chí được sử dụng trong plant lot
        public const string GRAFTED_EVALUATION_APPLY = "GraftedEvaluationApply";
        #endregion

        #region PLANT
        public const string PLANT_CRITERIA = "PlantCriteria";
        #endregion

        #region PRODUCT
        public const string PRODUCT_CRITERIA = "ProductCriteria";
        #endregion

        #region AI
        public const string PREDICT_PERCENT = "PredictPercent";
        #endregion
        #region CONFIG TIME TO TAKE ATTENDANCE
        public const string TIME_TO_TAKE_ATTEDANCE = "TimeToTakeAttendance";
        #endregion
        #region WORKLOG
        public const string DONE = "Done";
        public const string NOT_STARTED = "NotStarted";
        public const string IN_PROGRESS = "InProgress";
        public const string CANCELLED = "Cancelled";
        public const string OVERDUE = "Overdue";
        public const string REVIEWING = "Reviewing";
        public const string REDO = "Redo";
        public const string ONREDO = "OnRedo";
        public const string REJECTED = "Rejected";
        public const string RECEIVED = "Received";
        public const string REPLACED = "Replaced";
        public const string BEREPLACED = "BeReplaced";
        public const string FAILED = "Failed";
        #endregion
        #endregion

        #region CONFIG LAND
        // Cấu hình sử dụng trong tạo farm
        public const string MIN_LENGTH = "MinLength";
        public const string MIN_WIDTH = "MinWidth";
        public const string MIN_AREA = "MinArea";
        public const string MIN_ROW_OF_LAND_PLOT = "MinRowOfLandPlot";
        public const string MIN_PLANT_OF_LAND_ROW = "MinPlantOfLandRow";
        public const string COORDINATION_POINT_REQUIRED = "CoordiantionPointRequired";
        public const string MIN_DISTANCE_OF_PLANT = "MinDistancePlant";
        public const string MIN_TIME = "MinTime";
        public const string MAX_TIME = "MaxTime";
        public const string RECORD_AFTER_DATE = "RecordAfterDate";

        #endregion

        public static readonly HashSet<string> ADDABLE_CONFIG_KEYS = new HashSet<string>
        {
            PLANT_LOT_CRITERIA, PLANT_LOT_CONDITION_APPLY, PLANT_LOT_EVALUATION_APPLY,
            GRAFTED_CRITERIA, GRAFTED_CONDITION_APPLY, GRAFTED_EVALUATION_APPLY,
            PLANT_CRITERIA, PRODUCT_CRITERIA
        };
    }
}
