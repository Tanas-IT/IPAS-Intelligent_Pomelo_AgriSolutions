using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Common.Enum;
using CapstoneProject_SP25_IPAS_Repository.IRepository;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Repository.Repository
{
    public class OrdesRepository : GenericRepository<Order>, IOrdesRepository
    {
        private readonly IpasContext _context;

        public OrdesRepository(IpasContext context) : base(context) 
        {
            _context = context;
        }

        public async Task<double> GetTotalRevenueAsync()
        {
            return await _context.Orders
                .Where(o => o.TotalPrice.HasValue && o.Status.ToLower().Equals(OrderStatusEnum.Paid.ToString().ToLower()))
                .SumAsync(o => o.TotalPrice!.Value);
        }
    }
}
