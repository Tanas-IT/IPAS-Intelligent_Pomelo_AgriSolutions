using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities
{
    public partial class PlanNotification
    {
        public int PlanNotificationID { get; set; }
        public int? PlanID { get; set; }
        public int? NotificationID { get; set; }
        public int? UserID { get; set; }
        public bool? isRead { get; set; }
        public DateTime? CreatedDate { get; set; }

        public virtual Plan? Plan { get; set; }
        public virtual Notification? Notification { get; set; }
        public virtual User? User { get; set; }
    }
}
