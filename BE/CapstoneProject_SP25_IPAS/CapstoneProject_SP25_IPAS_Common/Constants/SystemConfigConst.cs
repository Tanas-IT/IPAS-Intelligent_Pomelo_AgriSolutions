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
        #region CONFIG FOR PLANT IN GRAFTED
        public const string GROWTH_EXPONENT = "Growth Exponent";
        public const string INITIAL_BRANCHING_COEFFICIENT = "Initial Branching Coefficient";
        public const string MAXIMUM_GRAFTING_LIMIT = "Maximum Grafting Limit";
        #endregion

        #region CONFIG MASTER TYPE
        // Target for work
        public const string WORK_TARGET = "Work Type";
        // Target for criteria
        public const string CRITERIA_TARGET = "Criteria Type";
        #endregion

        #region CONFIG CRITERIA APPLY FOR OBJECTS
        #region PLANT LOT
        public const string PLANT_LOT_CRITERIA = "PlantLot Criteria";  // Lấy tất cả các tiêu chí được sử dụng trong plant lot
        public const string PLANT_LOT_CONDITION_APPLY = "PlantLot Condition Apply"; // Các tiêu chí sử dụng trong condition check
        public const string PLANT_LOT_EVALUATION_APPLY = "PlantLot Evaluation Apply"; // Các tiêu chí sử dụng trong evaluation check
        #endregion

        #region GRAFTED
        public const string GRAFTED_CRITERIA = "Grafted Criteria"; // Lấy tất cả các tiêu chí được sử dụng trong plant lot
        public const string GRAFTED_CONDITION_APPLY = "Grafted Condition Apply"; // Lấy tất cả các tiêu chí được sử dụng trong plant lot
        public const string GRAFTED_EVALUATION_APPLY = "Grafted Evaluation Apply";
        #endregion

        #region PLANT
        public const string PLANT_CRITERIA = "Plant Criteria";
        #endregion

        #region PRODUCT
        public const string PRODUCT_CRITERIA = "Product Criteria";
        #endregion
        #endregion

        #region CONFIG LAND
        // Cấu hình sử dụng trong tạo farm
        public const string MIN_LENGTH = "Min Length";
        public const string MIN_WIDTH = "Min Width";
        public const string MIN_AREA = "Min Area";
        public const string MIN_ROW_OF_LAND_PLOT = "Min Row Of LandPlot";
        public const string MIN_PLANT_OF_LAND_ROW = "Min Plant Of LandRow";
        public const string COORDINATION_POINT_REQUIRED = "Coordiantion Point Required";
        public const string MIN_DISTANCE_OF_PLANT = "Min Distance Plant";

        #endregion

        public static readonly HashSet<string> ADDABLE_CONFIG_KEYS = new HashSet<string>
        {
            PLANT_LOT_CRITERIA, PLANT_LOT_CONDITION_APPLY, PLANT_LOT_EVALUATION_APPLY,
            GRAFTED_CRITERIA, GRAFTED_CONDITION_APPLY, GRAFTED_EVALUATION_APPLY,
            PLANT_CRITERIA, PRODUCT_CRITERIA
        };
    }
}
