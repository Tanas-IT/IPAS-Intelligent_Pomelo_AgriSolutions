using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.PlanModel;
using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.TaskFeedbackModels;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.WorkLogRequest;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.WorkLogModel
{
    public class WorkLogDetailModel
    {
        public int WorkLogId { get; set; }

        public string? WorkLogCode { get; set; }

        public string? Status { get; set; }
        public string? WorkLogName { get; set; }
        public string? PlanName { get; set; }
        public int? PlanId { get; set; }
        public string? PlanCode { get; set; }
        public string? HarvestHistoryCode { get; set; }
        public int? HarvestHistoryId { get; set; }
        public bool? IsHarvest { get; set; }
        public string? ProcessName { get; set; }
        public string? AssignorName { get; set; }
        public int? AssignorId { get; set; }
        public string? MasterTypeName { get; set; }

        public bool? IsTakeAttendance { get; set; }
        public string? ReasonDelay { get; set; }

        public DateTime? Date { get; set; }
        public TimeSpan? ActualStartTime { get; set; }

        public TimeSpan? ActualEndTime { get; set; }

        public bool? IsConfirm { get; set; }
        public string? WarningName { get; set; }
        public WorkLogBasicModel? RedoWorkLog { get; set; }
        public WorkLogBasicModel? OriginalWorkLog { get; set; }
        public List<ReporterModel>? ListEmployee { get; set; }
        public List<ReporterModel>? Reporter { get; set; }
        public string? CropName { get; set; }
        public List<PlanTargetDisplayModel>? PlanTargetModels { get; set; }
        public string? TypeWork { get; set; }
        public List<string>? ListGrowthStageName { get; set; }
        public List<TaskFeedbackModel>? ListTaskFeedback { get; set; }
        public List<NoteOfWorkLogModel>? ListNoteOfWorkLog { get; set; } = new List<NoteOfWorkLogModel>();
        public List<ReplacementEmployeeModel>? ReplacementEmployee { get; set; }

    }
}
