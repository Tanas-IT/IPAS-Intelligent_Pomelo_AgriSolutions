using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.MasterTypeDetailRequest
{
    public class UpdateMasterTypeDetailModel
    {
        public int? MasterTypeDetailId { get; set; }

        public string? MasterTypeDetailName { get; set; }

        public string? Value { get; set; }

        public string? TypeOfValue { get; set; }

        public int? ForeignKeyId { get; set; }

        public string? ForeignKeyTable { get; set; }

        //public int? MasterTypeId { get; set; }
    }
}
