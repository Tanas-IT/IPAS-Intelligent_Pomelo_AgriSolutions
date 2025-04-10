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
    public class EmployeeSkillRepository : GenericRepository<EmployeeSkill>, IEmployeeSkillRepository
    {
        private readonly IpasContext _context;

        public EmployeeSkillRepository(IpasContext context) : base(context)
        {
            _context = context;
        }

        public async Task<List<UserFarm>> GetListEmployeeByWorkTypeId(int workTypeId, int farmId)
        {
            var result = await _context.UserFarms
                                  .Include(e => e.User)
                                  .Include(e => e.EmployeeSkills)
                                  .ThenInclude(e => e.WorkType)
                                  .Where(x => x.FarmId == farmId)
                                  .Select(e => new {
                                      Employee = e,
                                      MatchingSkill = e.EmployeeSkills
                                          .FirstOrDefault(s => s.WorkTypeID == workTypeId)
                                  })
                                  .OrderByDescending(e => e.MatchingSkill != null) // ưu tiên người có skill trước
                                  .ThenByDescending(e => e.MatchingSkill != null ? e.MatchingSkill.ScoreOfSkill : 0)
                                  .Select(e => e.Employee)
                                  .ToListAsync();

          
            return result;
        }
    }
}
