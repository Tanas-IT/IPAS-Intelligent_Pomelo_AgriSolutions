using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.ReportModel
{
    public class MaterialsInStoreModel
    {
        public string Month { get; set; }
        public double? Count { get; set; }
        public List<TypeOfProduct>? TypeOfProduct { get; set; }
        public List<Materials>? Materials { get; set; }
    }

    public class TypeOfProduct
    {
        public string? PlantName { get; set; }
        public string? MasterTypeName { get; set; }
        public double? TotalQuantity { get; set; }
    }

    public class Materials
    {
        public string ProductType { get; set; }
        public UnitOfMaterials UnitOfMaterials { get; set; }

    }
    public class UnitOfMaterials
    {
        public double? Value { get; set; }
        public string? Unit { get; set; }
    }

}
