using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.HarvestHistoryRequest
{
    public class CreateHarvestHistoryRequest
    {
        [Required]
        public DateTime? DateHarvest { get; set; }

        public string? HarvestHistoryNote { get; set; }

        public double? TotalPrice { get; set; }
        [Required]
        public int? CropId { get; set; }

        public virtual ICollection<CreateHarvestTypeWoutPlantID> HarvestTypeHistories { get; set; } = new List<CreateHarvestTypeWoutPlantID>();

    }
}
