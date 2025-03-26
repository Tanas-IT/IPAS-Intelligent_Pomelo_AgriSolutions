using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Common.Constants
{
    public static class CacheKeyConst
    {
        public static string CACHE_KEY = "CACHE_KEY";
        #region LANDPLOT
        public static string LANDPLOT = "LANDPLOT";
        public static string GROUP_LANDPLOT = $"{LANDPLOT}:{CACHE_KEY}";
        public static string GROUP_FARM_LANDPLOT = $"{FARM}:{LANDPLOT}:{CACHE_KEY}";
        #endregion
        #region FARM
        public static string FARM = "FARM";
        #endregion

    }
}
