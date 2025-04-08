using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Request
{
    public class ChatRequest
    {
        public string Question { get; set; }
        public int? RoomId { get; set; }
    }
}
