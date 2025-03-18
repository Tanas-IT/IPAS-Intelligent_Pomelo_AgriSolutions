using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.ReportModel
{
    public class MaterialsInStoreModel
    {
        public string Season { get; set; }
        public int? Count { get; set; }
        public List<TypeOfProduct>? TypeOfProduct { get; set; }
    }

    public class TypeOfProduct
    {
        public string? PlantName { get; set; }
        public string? MasterTypeName { get; set; }
        public int? TotalQuantity { get; set; }
    }

}
