using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.UserBsModels;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.WorkLogModel;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.PlanModel
{
    public class PlanModel
    {
        public int PlanId { get; set; }

        public string? Status { get; set; }
        public string? PlanName { get; set; }

        public string? PlanCode { get; set; }

        public DateTime? CreateDate { get; set; }

        public DateTime? StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public DateTime? UpdateDate { get; set; }

        public bool? IsActive { get; set; }

        public string? Notes { get; set; }

        public string? PlanDetail { get; set; }

        public string? ResponsibleBy { get; set; }

        public string? Frequency { get; set; }

        public string? PesticideName { get; set; }
        public string? Progress { get; set; }

        public double? MaxVolume { get; set; }

        public double? MinVolume { get; set; }
        public bool? IsDelete { get; set; }

        public List<string>? PlantNames { get; set; }

        public List<string>? LandPlotNames { get; set; }

        public string? AssignorName { get; set; }

        public string? ProcessName { get; set; }
        public int? ProcessId { get; set; }

        public string? CropName { get; set; }
        public int? CropId { get; set; }
        public List<string>? GraftedPlantName { get; set; }

        public List<ForSelectedModels>? GrowthStages { get; set; }
        public List<ForSelectedModels>? ListLandPlotOfCrop { get; set; }

        public List<string>? PlantLotNames { get; set; }
        public List<int>? RowIndexs { get; set; }


        public string? MasterTypeName { get; set; }
        public DateTime? MinTime { get; set; }
        public DateTime? MaxTime { get; set; }
        public int? MasterTypeId { get; set; }
        public string? AssignedTo { get; set; }
        public string? AvatarOfAssignor { get; set; }
        public List<EmployeeWithSkills>? ListReporter { get; set; }
        public List<EmployeeWithSkills>? ListEmployee { get; set; }
        public string? DayOfWeek { get; set; }
        public string? DayOfMonth { get; set; }
        public string? CustomDates { get; set; }
        // public List<EmployeeWithSkills>? EmployeeWithSkills { get; set; }
        public bool? hasNonSampleProcess { get; set; }
        public TimeSpan? StartTime { get; set; }

        public TimeSpan? EndTime { get; set; }
        public List<WorkLogInPlanModel>? ListWorkLog { get; set; }
        public List<PlanTargetDisplayModel>? PlanTargetModels { get; set; }
    }
}
