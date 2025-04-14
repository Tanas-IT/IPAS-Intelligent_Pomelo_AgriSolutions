using CapstoneProject_SP25_IPAS_BussinessObject.Attributes;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.FarmBsModels
{
    public class CriteriaModel
    {
        public int CriteriaId { get; set; }
        [CsvExport("Criteria Code")]
        public string? CriteriaCode { get; set; }

        [CsvExport("Criteria Name")]
        public string? CriteriaName { get; set; }

        [CsvExport("Description")]
        public string? CriteriaDescription { get; set; }

        [CsvExport("Priority")]
        public int? Priority { get; set; }
        [CsvExport("Min Value")]
        public double? MinValue { get; set; }
        [CsvExport("Max Value")]
        public double? MaxValue { get; set; }
        [CsvExport("Unit")]
        public string? Unit { get; set; }
        [CsvExport("Is Active")]
        public bool? IsActive { get; set; }
        [CsvExport("Create Date")]
        public bool? CreateDate { get; set; }
        public bool? IsChecked { get; set; }
        public bool? IsPassed { get; set; }

        public int? MasterTypeId { get; set; }
        [CsvExport("Frequency Date")]
        public int? FrequencyDate { get; set; }

        [CsvExport("Criteria Set Name")]
        public string? MasterTypeName { get; set; }

        //public virtual ICollection<CriteriaGraftedPlant> CriteriaGraftedPlants { get; set; } = new List<CriteriaGraftedPlant>();

        //public virtual ICollection<CriteriaHarvestType> CriteriaHarvestTypes { get; set; } = new List<CriteriaHarvestType>();

        //public virtual MasterType? MasterType { get; set; }

        //public virtual ICollection<PlantCriteria> PlantCriteria { get; set; } = new List<PlantCriteria>();
    }
}
