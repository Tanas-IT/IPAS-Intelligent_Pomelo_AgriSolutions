using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.UserRequest
{
    public class FilterUserRequest
    {
        public DateTime? DobFrom { get; set; }
        public DateTime? DobTo { get; set; }
        public DateTime? CreateDateFrom { get; set; }
        public DateTime? CreateDateTo { get; set; }
        public string? Status { get; set; }
        //public int? RoleId { get; set; }
        public string? Genders { get; set; }
        public string? RoleIds { get; set; }
    }
}
