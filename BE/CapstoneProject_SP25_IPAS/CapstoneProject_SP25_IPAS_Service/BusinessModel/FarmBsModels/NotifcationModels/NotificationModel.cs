using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.FarmBsModels.NotifcationModels
{
    public class NotificationModel
    {
        public int NotificationId { get; set; }

        public string? NotificationCode { get; set; }

        public string? Title { get; set; }

        public string? Content { get; set; }

        public string? Link { get; set; }
        public bool? IsRead { get; set; }

        public DateTime? CreateDate { get; set; }

        public int? MasterTypeName { get; set; }
        public int? SenderName { get; set; }
    }
}
