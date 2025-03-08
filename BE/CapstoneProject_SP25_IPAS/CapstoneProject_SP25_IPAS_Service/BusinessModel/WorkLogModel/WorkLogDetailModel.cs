using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.PlanModel;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.TaskFeedbackModels;
using CapstoneProject_SP25_IPAS_Service.Service;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.WorkLogModel
{
    public class WorkLogDetailModel
    {
        public int WorkLogId { get; set; }

        public string? WorkLogCode { get; set; }

        public string? Status { get; set; }
        public string? WorkLogName { get; set; }

       
        public string? ReasonDelay { get; set; }

        public DateTime? Date { get; set; }
        public TimeSpan? ActualStartTime { get; set; }

        public TimeSpan? ActualEndTime { get; set; }

        public bool? IsConfirm { get; set; }
        public int? WarningName { get; set; }
        public List<ReporterModel>? ListEmployee { get; set; }
        public List<ReporterModel>? Reporter { get; set; }
        public string? CropName { get; set; }
        public string? ProcessName { get; set; }
        public PlanTargetDisplayModel? PlanTargetModels { get; set; }
        public string? TypeWork { get; set; }
        public List<string>? ListGrowthStageName { get; set; }
        public List<TaskFeedbackModel>? ListTaskFeedback { get; set; }
        public List<NoteOfWorkLogModel>? ListNoteOfWorkLog { get; set; }
    }
}
