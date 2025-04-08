using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Repository.IRepository;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Repository.Repository
{
    public class ChatMessageRepository : GenericRepository<ChatMessage>, IChatMessageRepository
    {
        private readonly IpasContext _context;

        public ChatMessageRepository(IpasContext context) : base(context)
        {
            _context = context;
        }

        public async Task<List<ChatMessage>> GetChatMessagesByRoomId(int roomId)
        {
            var result = await _context.ChatMessages.Where(x => x.RoomId == roomId).ToListAsync();
            return result;
        }
    }
}
