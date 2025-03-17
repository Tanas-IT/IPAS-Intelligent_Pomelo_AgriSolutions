using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.NotificationRequest
{
    public class CreateNotificationRequest
    {
        //public string? NotificationCode { get; set; }

        public string? Title { get; set; }

        public string? Content { get; set; }

        public string? Link { get; set; }

        public int? MasterTypeId { get; set; }
        public int? UserId { get; set; }
    }
}
