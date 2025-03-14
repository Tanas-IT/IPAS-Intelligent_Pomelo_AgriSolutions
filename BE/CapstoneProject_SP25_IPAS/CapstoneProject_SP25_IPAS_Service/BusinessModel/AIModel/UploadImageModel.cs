using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.AIModel
{
    public class UploadImageModel
    {
        public List<string> ImageUrls { get; set; }
        public List<string> TagIds { get; set; } // Danh sách tag ID, cách nhau bằng dấu ","
    }
}
