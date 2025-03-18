using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.FarmBsModels
{
    public class PlantCriteriaModel
    {
        public int PlantId { get; set; }

        public int CriteriaId { get; set; }

        public bool? IsChecked { get; set; }

        public int? Priority { get; set; }

        public string? CriteriaName { get; set; }

        //public virtual CriteriaModel Criteria { get; set; } = null!;

        //public virtual PlantModel Plant { get; set; } = null!;
    }
}
