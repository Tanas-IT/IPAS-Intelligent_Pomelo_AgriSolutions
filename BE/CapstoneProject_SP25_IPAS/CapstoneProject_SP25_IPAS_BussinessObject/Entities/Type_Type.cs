using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities
{
    public partial class Type_Type
    {
        [Column("MasterTypeID_1")]
        public int ProductId { get; set; }
        [Column("MasterTypeID_2")]
        public int CriteriaSetId { get; set; }
        public bool? IsActive { get; set; }
        [ForeignKey(nameof(ProductId))]
        public virtual MasterType? Product { get; set; }
        [ForeignKey(nameof(CriteriaSetId))]
        public virtual MasterType? CriteriaSet { get; set; }
    }
}
