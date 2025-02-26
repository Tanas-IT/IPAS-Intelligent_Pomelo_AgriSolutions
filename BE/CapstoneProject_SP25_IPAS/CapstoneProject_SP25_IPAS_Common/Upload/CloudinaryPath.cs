using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Common.Upload
{
    public static class CloudinaryPath
    {
        #region farm
        public static string FARM = "farm";
        public static string FARM_LOGO = FARM + "/Logo";
        public static string FARM_LEGAL_DOCUMENT = FARM + "/legal-document";
        #endregion

        #region User
        public static string USER = "user";
        public static string USER_AVARTAR = USER + "/avatar";
        #endregion

        #region Plant
        public static string PLANT = "plant";
        public static string PLANT_IMAGE = PLANT + "/image";
        public static string PLANT_GROWTH_HISTORY = PLANT + "/growth-history";
        #endregion

        #region Grafted Plant
        public static string GRAFTED_PLANT = "grafted-plant";
        public static string GRAFTED_PLANT_NOTE = GRAFTED_PLANT + "/note";
        #endregion

    }
}
