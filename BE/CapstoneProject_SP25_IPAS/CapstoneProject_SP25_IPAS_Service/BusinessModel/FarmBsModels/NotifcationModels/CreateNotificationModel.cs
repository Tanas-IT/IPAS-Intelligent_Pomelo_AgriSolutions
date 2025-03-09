using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels.NotifcationModels
{
    public class CreateNotificationModel
    {
        public string? Title { get; set; }

        public string? Content { get; set; }

        public string? Link { get; set; }
        public bool? IsRead { get; set; }
        public DateTime? CreateDate { get; set; }

        public int? MasterTypeId { get; set; }
        public int? SenderID { get; set; }
        public List<int>? ListReceiverId { get; set; }
    }
}
