using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.PlanRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.Validation;
using System.ComponentModel.DataAnnotations;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.PlanModel
{
    public class CreatePlanModel
    {
        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }
        public bool? IsActive { get; set; }
        public string? PlanName { get; set; }

        public string? Notes { get; set; }

        public string? PlanDetail { get; set; }

        public string? ResponsibleBy { get; set; }

        public string? Frequency { get; set; }

        public int? AssignorId { get; set; }

        public int? ProcessId { get; set; }
        public int? SubProcessId { get; set; }

        public int? CropId { get; set; }

        public List<int>? GrowthStageId { get; set; }

        public List<int>? ListLandPlotOfCrop { get; set; }

        public int? MasterTypeId { get; set; }

        public List<int>? DayOfWeek { get; set; }
        public List<int>? DayOfMonth { get; set; }
        public List<DateTime>? CustomDates { get; set; }
        public List<EmployeeModel> ListEmployee { get; set; } = new List<EmployeeModel>();

        [FlexibleTime]
        public string StartTime { get; set; }

        [FlexibleTime]
        public string EndTime { get; set; }

        public List<PlanTargetModel>? PlanTargetModel { get; set; }
        //public List<CriteriaData>? ListCriteria { get; set; }
        // ✅ Constructor mặc định
        public CreatePlanModel() { }

        // ✅ Constructor copy để tạo bản sao
        public CreatePlanModel(CreatePlanModel model)
        {
            PlanName = model.PlanName;
            StartDate = model.StartDate;
            EndDate = model.EndDate;
            IsActive = model.IsActive;
            Notes = model.Notes;
            PlanDetail = model.PlanDetail;
            ResponsibleBy = model.ResponsibleBy;
            Frequency = model.Frequency;
            AssignorId = model.AssignorId;
            ProcessId = model.ProcessId;
            CropId = model.CropId;
            GrowthStageId = model.GrowthStageId;
            MasterTypeId = model.MasterTypeId;
            DayOfWeek = model.DayOfWeek != null ? new List<int>(model.DayOfWeek) : null;
            DayOfMonth = model.DayOfMonth != null ? new List<int>(model.DayOfMonth) : null;
            CustomDates = model.CustomDates != null ? new List<DateTime>(model.CustomDates) : null;
            ListEmployee = model.ListEmployee != null ? new List<EmployeeModel>(model.ListEmployee) : new List<EmployeeModel>();
            StartTime = model.StartTime;
            EndTime = model.EndTime;
            PlanTargetModel = model.PlanTargetModel != null ? new List<PlanTargetModel>(model.PlanTargetModel) : new List<PlanTargetModel>();
        }
    }
}
