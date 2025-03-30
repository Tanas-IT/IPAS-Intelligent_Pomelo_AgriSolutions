using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.WorkLogModel
{
    public class UserWorklogModel
    {
        public int UserWorkLogID { get; set; }
        public int WorkLogId { get; set; }
        public int UserId { get; set; }
        public string? Notes { get; set; }
        public string? Issue { get; set; }
        public string? StatusOfUserWorkLog { get; set; }
        public int? ReplaceUserId { get; set; }
        public DateTime? CreateDate { get; set; }
        public bool? IsReporter { get; set; }
        public string? UserName { get; set; }
    }
}
