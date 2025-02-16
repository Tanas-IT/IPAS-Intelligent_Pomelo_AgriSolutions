using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.ReportModel
{
    public class PomeloQualityBreakDown
    {
        public string Quater {  get; set; }
        public Dictionary<string, int>? Quality { get; set; }
    }
}
