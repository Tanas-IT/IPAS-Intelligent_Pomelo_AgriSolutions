using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.GraftedRequest
{
    public class CreatePlantFromGraftedRequest
    {
        public int graftedId { get; set; }
        public int PlantIndex { get; set; }
        public int LandRowId { get; set; }
    }
}
