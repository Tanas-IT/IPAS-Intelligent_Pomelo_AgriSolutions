using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.PlanRequest;
using CapstoneProject_SP25_IPAS_BussinessObject.Validation;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.WorkLogRequest
{
    public class AddNewTaskModel
    {
        public string? TaskName { get; set; }
        public int? HarvestHistoryId { get; set; }
        public int? AssignorId { get; set; }
        [FlexibleTime]
        public string? StartTime { get; set; }
        [FlexibleTime]
        public string? EndTime { get; set; }
        public DateTime? DateWork { get; set; }
        public List<EmployeeModel>? listEmployee {  get; set; }
    }
}
