using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.ProgramSetUpObject
{
    public class PayOSKey
    {
        public string ClientId { get; set; }
        public string ApiKey { get; set; }
        public string ChecksumKey { get; set; }
        public string Domain { get; set; }
        public string ReturnPath { get; set; }
        public string CanclePath { get; set; }
    }
}
