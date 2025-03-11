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

        public string? Title { get; set; }

        public string? Content { get; set; }
        public string? Link { get; set; }
        public bool? IsRead { get; set; }
        public string? Color { get; set; }

        public DateTime? CreateDate { get; set; }

        public MasterTypeNotification? MasterType { get; set; }
        public SenderNotification? Sender { get; set; }
    }

    public class MasterTypeNotification
    {
        public int? MasterTypeId { get; set; }
        public string? MasterTypeName { get; set; }
    }

    public class SenderNotification
    {
        public int? SenderId { get; set; }
        public string? SenderName { get; set; }
        public string? SenderAvatar { get; set; }
    }
}
