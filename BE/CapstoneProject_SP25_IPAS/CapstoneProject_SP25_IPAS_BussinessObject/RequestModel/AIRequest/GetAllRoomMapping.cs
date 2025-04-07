using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.AIModel;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.AIRequest
{
    public class GetAllRoomMapping
    {
        public DateTime CreateDate { get; set; }
        public List<RoomModel>?  ListChatRoom { get; set; }
    }

    public class RoomModel
    {
        public int RoomId { get; set; }

        public string? RoomCode { get; set; }

        public string? RoomName { get; set; }

        public DateTime? CreateDate { get; set; }

        public int? AiresponseId { get; set; }

        public int? CreateBy { get; set; }
        public int? FarmID { get; set; }
        public int? UserID { get; set; }
    }
}
