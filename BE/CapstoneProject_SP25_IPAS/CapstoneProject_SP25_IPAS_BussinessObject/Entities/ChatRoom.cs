using System;
using System.Collections.Generic;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities;

public partial class ChatRoom
{
    public int RoomId { get; set; }

    public string? RoomCode { get; set; }

    public string? RoomName { get; set; }

    public DateTime? CreateDate { get; set; }

    public int? AiresponseId { get; set; }

    public int? CreateBy { get; set; }
    public int? FarmID { get; set; }
    public int? UserID { get; set; }

    public virtual ICollection<ChatMessage> ChatMessages { get; set; } = new List<ChatMessage>();

    public virtual User? CreateByNavigation { get; set; }
}
