using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.AIModel
{
    public class ChatRoomModel
    {
        public int? RoomId { get; set; }
        public string? RoomName { get; set; }
        public List<ChatMessageModel>? ChatMessages { get; set; }
    }
    public class ChatMessageModel
    {
        public int MessageId { get; set; }

        public string? Question { get; set; }

        public string? Answer { get; set; }

        public DateTime? CreateDate { get; set; }

        public DateTime? UpdateDate { get; set; }

        public int? SenderId { get; set; }

        public string? MessageType { get; set; }

        
    }
}
