using CapstoneProject_SP25_IPAS_Service.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.IService
{
    public interface ITypeTypeService
    {
        public Task<BusinessResult> GetCriteriaSetForProduct(int productId);
        public Task<BusinessResult> ApplyCriteriaSetToProduct(int productId, List<int> criteriaSetIds);
        public Task<BusinessResult> DeleteCriteriaSetFromProduct(int productId, int criteriaSetId);
        public Task<BusinessResult> UpdateCriteriaSetStatus(int productId, int criteriaSetId, bool isActive);

    }
}
