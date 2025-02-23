using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Repository.IRepository
{
    public interface ICriteriaTargetRepository
    {
        public Task<IEnumerable<CriteriaTarget>> GetAllCriteriaOfTargetNoPaging(int? plantId, int? graftedPlantId, int? plantLotId);
        

    }
}
