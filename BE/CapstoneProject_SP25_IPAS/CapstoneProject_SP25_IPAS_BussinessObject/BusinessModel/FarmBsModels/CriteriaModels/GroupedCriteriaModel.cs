using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.FarmBsModels.CriteriaModels
{
    public class GroupedCriteriaModel
    {
        public int MasterTypeId { get; set; }
        public string? MasterTypeName { get; set; }
        public string? Target { get; set; }
        public string? TargetDisplay { get; set; }
        public List<CriteriaInfoModel> CriteriaList { get; set; } = new();
    }

    public class CriteriaInfoModel
    {
        public int? CriteriaTargetId { get; set; }
        public int? PlantId { get; set; }
        public int? GraftedPlantId { get; set; }
        public int? PlantLotId { get; set; }
        public int? CriteriaId { get; set; }
        public string? CriteriaName { get; set; }
        //public bool? IsChecked { get; set; }
        public double? ValueChecked { get; set; }
        public DateTime? CreateDate { get; set; }
        public DateTime? CheckedDate { get; set; }
        public string? Unit { get; set; }
        public double? MinValue { get; set; }
        public double? MaxValue { get; set; }
        public int? Priority { get; set; }
        public bool? IsPassed { get; set; }
        public string? Description { get; set; }
        public int? FrequencyDate { get; set; }


    }
}
