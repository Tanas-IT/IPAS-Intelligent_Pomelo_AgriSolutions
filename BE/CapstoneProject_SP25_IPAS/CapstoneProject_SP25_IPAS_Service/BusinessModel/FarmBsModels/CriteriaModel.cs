using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels
{
    public class CriteriaModel
    {
        public int CriteriaId { get; set; }

        public string? CriteriaCode { get; set; }

        public string? CriteriaName { get; set; }

        public string? CriteriaDescription { get; set; }

        public int? Priority { get; set; }

        public bool? IsActive { get; set; }

        public bool? IsChecked { get; set; }

        public int? CriteriaTypeId { get; set; }

        //public virtual ICollection<CriteriaGraftedPlant> CriteriaGraftedPlants { get; set; } = new List<CriteriaGraftedPlant>();

        //public virtual ICollection<CriteriaHarvestType> CriteriaHarvestTypes { get; set; } = new List<CriteriaHarvestType>();

        //public virtual MasterTypeModels? CriteriaType { get; set; }

        //public virtual ICollection<PlantCriteria> PlantCriteria { get; set; } = new List<PlantCriteria>();
    }
}
