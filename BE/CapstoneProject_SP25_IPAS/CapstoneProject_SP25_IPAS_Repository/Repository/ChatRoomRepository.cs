using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Repository.IRepository;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Repository.Repository
{
    public class ChatRoomRepository : GenericRepository<ChatRoom>, IChatRoomRepository
    {
        private readonly IpasContext _context;
        public ChatRoomRepository(IpasContext context) : base(context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ChatRoom>> Get(
           Expression<Func<ChatRoom, bool>> filter = null!,
           Func<IQueryable<ChatRoom>, IOrderedQueryable<ChatRoom>> orderBy = null!,
           int? pageIndex = null, // Optional parameter for pagination (page number)
           int? pageSize = null)  // Optional parameter for pagination (number of records per page)
        {
            IQueryable<ChatRoom> query = dbSet;

            if (filter != null)
            {
                query = query.Where(filter);
            }

            query = query.Include(x => x.ChatMessages)
                .ThenInclude(x => x.Resources);

            if (orderBy != null)
            {
                query = orderBy(query);
            }

            // Implementing pagination
            //if (pageIndex.HasValue && pageSize.HasValue)
            //{
            //    // Ensure the pageIndex and pageSize are valid
            //    int validPageIndex = pageIndex.Value > 0 ? pageIndex.Value - 1 : 0;
            //    int validPageSize = pageSize.Value > 0 ? pageSize.Value : 5; // Assuming a default pageSize of 10 if an invalid value is passed

            //    query = query.Skip(validPageIndex * validPageSize).Take(validPageSize);
            //}

            return await query.AsNoTracking().ToListAsync();
        }
    }
}
