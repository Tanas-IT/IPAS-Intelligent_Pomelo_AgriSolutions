using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Attributes
{
    public class CsvExportAttribute : Attribute
    {
        public string DisplayName { get; }

        public CsvExportAttribute(string displayName)
        {
            DisplayName = displayName;
        }
    }
}
