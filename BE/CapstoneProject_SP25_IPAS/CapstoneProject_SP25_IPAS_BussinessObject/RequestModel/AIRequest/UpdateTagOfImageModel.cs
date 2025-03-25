using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.AIRequest
{
    public class UpdateTagOfImageModel
    {
        public Guid imageId {  get; set; }
        public string tagId { get; set; }
    }
}
