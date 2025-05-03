using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.ProcessModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.AIModel
{
    public class ProcessRecomendResponseModel
    {
        public string? processDescription { get; set; }
        public CreateManyProcessModel? processGenerate { get; set; } = new();
        public bool? success { get; set; }
        public string? message { get; set; }
    }
}
