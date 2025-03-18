using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.MasterTypeModels;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.MasterTypeDetail
{
    public class TypeTypeModel
    {
        public int ProductId { get; set; }
        public string? ProductName { get; set; }
        public int CriteriaSetId { get; set; }
        public bool? IsActive { get; set; }
        //public virtual MasterType? Product { get; set; }
        public MasterTypeModel? CriteriaSet { get; set; }
    }
}
