using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.ChatModel
{
    public class ChatMessageModel
    {
        public int MessageId { get; set; }

        public string? MessageCode { get; set; }

        public string? MessageContent { get; set; }

        public DateTime? CreateDate { get; set; }

        public DateTime? UpdateDate { get; set; }

        public int? SenderId { get; set; }

        public bool? IsUser { get; set; }

        public string? MessageType { get; set; }

        public int? RoomId { get; set; }
        public int? UserId { get; set; }
        public int? FarmId { get; set; }
    }
}
