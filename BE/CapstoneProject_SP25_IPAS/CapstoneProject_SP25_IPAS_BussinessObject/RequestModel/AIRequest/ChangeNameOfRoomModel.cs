using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.AIRequest
{
    public class ChangeNameOfRoomModel
    {
        public int RoomID { get; set; }
        public string NewRoomName { get; set; }
    }
}
