using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.MasterTypeDetail;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.MasterTypeModels
{
    public class MasterTypeModel
    {
        public int MasterTypeId { get; set; }

        public string? MasterTypeCode { get; set; }

        public string? MasterTypeName { get; set; }

        public string? MasterTypeDescription { get; set; }

        public bool? IsActive { get; set; }

        public DateTime? CreateDate { get; set; }

        public DateTime? UpdateDate { get; set; }

        public string? CreateBy { get; set; }

        public string? TypeName { get; set; }

        //public bool? IsDelete { get; set; }

        public bool? IsDefault { get; set; }

        public string? BackgroundColor { get; set; }

        public string? TextColor { get; set; }

        public string? Characteristic { get; set; }

        public int? FarmId { get; set; }

        public bool? IsConflict { get; set; }
        public string? Target { get; set; }

        public ICollection<CriteriaModel> Criterias { get; set; } = new List<CriteriaModel>();
        //public ICollection<MasterTypeDetailModel> MasterTypeDetailModels { get; set; } = new List<MasterTypeDetailModel>();

        //public virtual ICollection<MasterTypeDetailModel> MasterTypeDetails { get; set; } = new List<MasterTypeDetailModel>();


    }
}
