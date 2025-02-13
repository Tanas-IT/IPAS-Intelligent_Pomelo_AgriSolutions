using CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.MasterTypeModels
{
    public class CriteriaMasterTypeModel
    {
        public int CriteriaName { get; set; }
        public int MasterTypeName { get; set; }
        public bool IsActive { get; set; }

        public CriteriaModel CriteriaModel { get; set; }
    }
}
