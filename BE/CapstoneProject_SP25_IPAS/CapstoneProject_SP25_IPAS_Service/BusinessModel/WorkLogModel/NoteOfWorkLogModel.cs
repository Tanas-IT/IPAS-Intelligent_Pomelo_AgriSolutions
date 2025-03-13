using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.WorkLogModel
{
    public class NoteOfWorkLogModel
    {
        public string? Notes { get; set; }
        public DateTime? CreateDate { get; set; }
        public string? FullName { get; set; }
        public string? AvatarURL { get; set; }
        public string? Issue { get; set; }
        public int? UserId { get; set; }
        public List<ResourceOfWorkLogModel>? ListResources { get; set; }
    }
}
