using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.MasterTypeDetail;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.MasterTypeModels
{
    public class CreateMasterTypeModel
    {
        public string? MasterTypeName { get; set; }

        public string? MasterTypeDescription { get; set; }

        public bool? IsActive { get; set; }

        public string? CreateBy { get; set; }

        public string? TypeName { get; set; }

        public List<CreateMasterTypeDetailModel>? ListMasterTypeDetail { get; set; }

    }
}
