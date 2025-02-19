using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Common.Utils
{
    public static class Util
    {
        public static bool IsValidInteger(int value)
        {
            return value >= int.MinValue && value <= int.MaxValue;
        }
        public static bool IsValidDecimal(decimal value)
        {
            return value >= decimal.MinValue && value <= decimal.MaxValue;
        }
        public static DateTime ConvertUnixTimeToDateTime(long utcExpireDate)
        {
            var dateTimeInterval = new DateTime(1970, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc);
            dateTimeInterval = dateTimeInterval.AddSeconds(utcExpireDate).ToUniversalTime();

            return dateTimeInterval;
        }

        public static List<string> SplitByComma(string input)
        {
            if (string.IsNullOrWhiteSpace(input))
            {
                return new List<string>(); 
            }

            return input.Split(',', StringSplitOptions.RemoveEmptyEntries)
                        .Select(s => s.Trim().ToLower()) 
                        .ToList();
        }
    }
}
