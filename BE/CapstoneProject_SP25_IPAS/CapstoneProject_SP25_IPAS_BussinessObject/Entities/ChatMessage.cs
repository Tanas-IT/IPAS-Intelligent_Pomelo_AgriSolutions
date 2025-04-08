using System;
using System.Collections.Generic;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities;

public partial class ChatMessage
{
    public int MessageId { get; set; }

    public string? Question { get; set; }

    public string? MessageContent { get; set; }

    public DateTime? CreateDate { get; set; }

    public DateTime? UpdateDate { get; set; }

    public int? SenderId { get; set; }

    public bool? IsUser { get; set; }

    public string? MessageType { get; set; }

    public int? RoomId { get; set; }

    public virtual ChatRoom? Room { get; set; }
}
