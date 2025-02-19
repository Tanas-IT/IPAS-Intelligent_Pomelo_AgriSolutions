using CapstoneProject_SP25_IPAS_Service.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.IService
{
    public interface IPackageService
    {
        public Task<BusinessResult> GetPackageById(int packageId);
        public Task<BusinessResult> GetListPackage();
        public Task<BusinessResult> GetPackageExpiredOfFarm(int farmId);
    }
}
