using CapstoneProject_SP25_IPAS_BussinessObject.Entities;


//using CapstoneProject_SP25_IPAS_Service.BusinessModel.MasterTypeDetail;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.MasterTypeRequest
{
    public class CreateMasterTypeRequestModel
    {
        public string? MasterTypeName { get; set; }

        public string? MasterTypeDescription { get; set; }

        public bool? IsActive { get; set; }

        public string? CreateBy { get; set; }

        public string? TypeName { get; set; }
        public int? MaxTime { get; set; }
        public int?  MinTime { get; set; }
        public string? BackgroundColor { get; set; }

        public string? TextColor { get; set; }

        public string? Characteristic { get; set; }

        public int? FarmId { get; set; }
        public bool? IsConflict { get; set; }
        public string? Target { get; set; }


        //public List<CreateMasterTypeDetailModel> createMasterTypeDetail { get; set; } = new List<CreateMasterTypeDetailModel>();
    }
}
