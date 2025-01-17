﻿using System;
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

    public bool? IsRead { get; set; }

    public int? UserId { get; set; }

    public int? NotificationTypeId { get; set; }

    public virtual NotificationType? NotificationType { get; set; }

    public virtual User? User { get; set; }
}
