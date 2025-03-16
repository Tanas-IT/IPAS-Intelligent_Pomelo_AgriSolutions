using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.PlantLotModel
{
    public class GetPlantLotRequest
    {
        public int? FarmId { get; set; }
        public bool? isFromGrafted { get; set; }
        public DateTime? ImportedDateFrom { get; set; }
        public DateTime? ImportedDateTo { get; set; }
        public string? PartnerId { get; set; }
        public string? Status { get; set; }
        public int? PreviousQuantityFrom { get; set; }
        public int? PreviousQuantityTo { get; set; }

    }
}
