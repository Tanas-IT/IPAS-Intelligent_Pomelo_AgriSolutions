using System;
using System.Collections.Generic;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities;

public partial class User
{
    public int UserId { get; set; }

    public string? Email { get; set; }

    public string? Password { get; set; }

    public string? FullName { get; set; }

    public string? PhoneNumber { get; set; }

    public string? Gender { get; set; }

    public DateTime? Dob { get; set; }

    public string? UserCode { get; set; }

    public DateTime? CreateDate { get; set; }

    public DateTime? UpdateDate { get; set; }

    public bool? IsDeleted { get; set; }

    public DateTime? DeleteDate { get; set; }

    public string? Status { get; set; }

    public int? IsDependency { get; set; }

    public int? RoleId { get; set; }

    public string? AvatarURL { get; set; }

    public string? Otp { get; set; }

    public DateTime? ExpiredOtpTime { get; set; }

    public string? Address { get; set; }
    public string? Fcmtoken { get; set; }

    public int? RemainDays { get; set; }

    public virtual ICollection<ChatRoom> ChatRooms { get; set; } = new List<ChatRoom>();

    public virtual ICollection<Notification> NotificationSenders { get; set; } = new List<Notification>();

    public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();

    public virtual Role? Role { get; set; }

    public virtual ICollection<TaskFeedback> TaskFeedbacks { get; set; } = new List<TaskFeedback>();

    public virtual ICollection<UserFarm> UserFarms { get; set; } = new List<UserFarm>();

    public virtual ICollection<UserWorkLog> UserWorkLogs { get; set; } = new List<UserWorkLog>();
    public virtual ICollection<Plan> Plans { get; set; } = new List<Plan>();
    public virtual ICollection<PlanNotification> PlanNotifications { get; set; } = new List<PlanNotification>();
    public virtual ICollection<Report> Answerers { get; set; } = new List<Report>();
    public virtual ICollection<Report> Questioners { get; set; } = new List<Report>();
    public virtual ICollection<PlantGrowthHistory> PlantGrowthHistories { get; set; } = new List<PlantGrowthHistory>();
    public virtual ICollection<GraftedPlantNote> GraftedPlantNotes { get; set; } = new List<GraftedPlantNote>();
    public virtual ICollection<ProductHarvestHistory> ProductHarvestHistories { get; set; } = new List<ProductHarvestHistory>();
}
