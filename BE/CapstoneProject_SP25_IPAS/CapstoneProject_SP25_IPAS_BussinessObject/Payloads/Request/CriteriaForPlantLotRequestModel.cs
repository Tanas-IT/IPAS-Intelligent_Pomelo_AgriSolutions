using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Request
{
    public class CriteriaForPlantLotRequestModel
    {
        public int? CriteriaId { get; set; }

        public string? CriteriaCode { get; set; }

        public string? CriteriaName { get; set; }

        public string? CriteriaDescription { get; set; }

        public int? Priority { get; set; }

        public bool? IsChecked { get; set; }

        public int? CriteriaTypeId { get; set; }
    }
}
