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
    public class LegalDocumentRepository : GenericRepository<LegalDocument>, ILegalDocumentRepository
    {
        private readonly IpasContext _context;

        public LegalDocumentRepository(IpasContext context) : base(context)
        {
            _context = context;
        }

        public async Task<int> GetLastID()
        {
            var lastId = await _context.LegalDocuments.MaxAsync(x => x.LegalDocumentId);
            if (lastId <= 0)
                return 1;
            return lastId + 1; 
        }
    }
}
