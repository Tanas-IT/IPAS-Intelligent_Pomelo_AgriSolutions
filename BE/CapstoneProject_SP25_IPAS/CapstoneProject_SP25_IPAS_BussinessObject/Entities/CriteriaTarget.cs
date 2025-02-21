using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities
{
    public partial class CriteriaTarget
    {
        public int CriteriaTargetId { get; set; }

        public bool? isChecked { get; set; }

        public int? Priority { get; set; }

        public int? PlantID { get; set; }

        public int? CriteriaID { get; set; }

        public int? GraftedPlantID { get; set; }

        public int? PlantLotID { get; set; }

        public virtual Plant? Plant { get; set; }
        public virtual Criteria? Criteria { get; set; }
        public virtual GraftedPlant? GraftedPlant { get; set; }
        public virtual PlantLot? PlantLot { get; set; }
    }
}
