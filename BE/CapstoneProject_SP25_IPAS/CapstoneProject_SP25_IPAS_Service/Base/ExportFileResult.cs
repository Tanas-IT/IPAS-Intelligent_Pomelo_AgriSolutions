using CapstoneProject_SP25_IPAS_Common.Constants;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.Base
{
    public class ExportFileResult
    {
        public byte[] FileBytes { get; set; } = Array.Empty<byte>();
        public string FileName { get; set; } = string.Empty;
        public string ContentType { get; set; } = FileFormatConst.CSV_CONTENT_TYPE;
    }
}
