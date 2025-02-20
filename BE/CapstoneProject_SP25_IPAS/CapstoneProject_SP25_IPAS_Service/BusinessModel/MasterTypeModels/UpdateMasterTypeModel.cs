using CapstoneProject_SP25_IPAS_Service.BusinessModel.MasterTypeDetail;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.MasterTypeModels
{
    public class UpdateMasterTypeModel
    {
        public int MasterTypeId { get; set; }

        public string? MasterTypeName { get; set; }

        public string? MasterTypeDescription { get; set; }

        public bool? IsActive { get; set; }

        //public string? CreateBy { get; set; }

        public string? TypeName { get; set; }

        public string? BackgroundColor { get; set; }

        public string? TextColor { get; set; }

        public string? Characteristic { get; set; }

        //public bool? IsDelete { get; set; }

        //public List<UpdateMasterTypeDetailModel> MasterTypeDetails { get; set; } = new List<UpdateMasterTypeDetailModel>();
    }
}
