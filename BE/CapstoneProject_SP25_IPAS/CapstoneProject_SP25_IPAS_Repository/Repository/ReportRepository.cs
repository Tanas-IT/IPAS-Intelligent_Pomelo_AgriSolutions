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
    public class ReportRepository : GenericRepository<Report>, IReportRepository
    {
        private readonly IpasContext _context;

        public ReportRepository(IpasContext context) : base(context)
        {
            _context = context;
        }

        public async Task<Report> GetReportByImageURL(string imageURL)
        {
            var getReportOfImageURL = await _context.Reports.FirstOrDefaultAsync(x => x.ImageURL.Equals(imageURL));
            return getReportOfImageURL;
        }
    }
}
