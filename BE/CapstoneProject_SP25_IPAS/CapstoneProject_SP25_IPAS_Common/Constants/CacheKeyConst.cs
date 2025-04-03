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
        #region PLAN
        public static string PLAN = "PLAN";
        public static string GROUP_PLAN = $"{PLAN}:{CACHE_KEY}";
        public static string GROUP_FARM_PLAN = $"{FARM}:{PLAN}:{CACHE_KEY}";
        #endregion
        #region WORKLOG
        public static string WORKLOG = "WORKLOG";
        public static string GROUP_WORKLOG = $"{WORKLOG}:{CACHE_KEY}";
        public static string GROUP_FARM_WORKLOG = $"{FARM}:{WORKLOG}:{CACHE_KEY}";
        #endregion
        #region AI
        public static string AI = "AI";
        public static string GROUP_AI = $"{AI}:{CACHE_KEY}";
        public static string GROUP_FARM_AI = $"{FARM}:{AI}:{CACHE_KEY}";
        #endregion
        #region FARM
        public static string FARM = "FARM";
        #endregion

    }
}
