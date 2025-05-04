using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Common.Enum;
using CapstoneProject_SP25_IPAS_Repository.IRepository;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
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
                                  .Where(x => x.FarmId == farmId && x.RoleId != (int)RoleEnum.OWNER)
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

        public async Task<List<EmployeeSkill>> GetEmployeeSkillByUserIdAndFarmId(int userId, int farmId)
        {
            var getEmployeeSkill = await _context.EmployeeSkills.Where(x => x.EmployeeID == userId && x.FarmID == farmId).ToListAsync();
            return getEmployeeSkill;
        }

        public async Task<List<UserFarm>> GetListEmployeeByTarget(string? target, int farmId)
        {
            if(target != null)
            {
                target = target.ToLower();
            }

            var result = await _context.UserFarms
                .Include(e => e.User)
                .Include(e => e.EmployeeSkills)
                    .ThenInclude(es => es.WorkType)
                .Where(x => x.FarmId == farmId && x.RoleId != (int)RoleEnum.OWNER)
                .Select(e => new
                {
                    Employee = e,
                    MatchingSkill = e.EmployeeSkills
                        .FirstOrDefault(s => s.WorkType.Target.ToLower() == target)
                })
                .OrderByDescending(x => x.MatchingSkill != null) // có kỹ năng được ưu tiên trước
                .ThenByDescending(x => x.MatchingSkill != null ? x.MatchingSkill.ScoreOfSkill : 0)
                .Select(x => x.Employee)
                .ToListAsync();

            return result;
        }
    }
}
