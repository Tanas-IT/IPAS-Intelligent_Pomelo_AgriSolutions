using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.Service.CompareImage
{
    public interface IImageHashCompareService
    {
        public Task<ulong> GetHashFromUrlAsync(string url);
        public double CalculateDistance(ulong hash1, ulong hash2);
    }
}
