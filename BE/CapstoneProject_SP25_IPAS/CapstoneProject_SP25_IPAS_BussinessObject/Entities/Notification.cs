using System;
using System.Collections.Generic;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities;

public partial class Notification
{
    public int NotificationId { get; set; }

    public string? NotificationCode { get; set; }

    public string? Title { get; set; }

    public string? Content { get; set; }

    public string? Link { get; set; }

    public DateTime? CreateDate { get; set; }

    public int? MasterTypeId { get; set; }
    public int? SenderID { get; set; }
    public virtual MasterType? MasterType { get; set; }

    public virtual User? Sender { get; set; }
    public virtual ICollection<PlanNotification> PlanNotifications { get; set; } = new List<PlanNotification>();
}
