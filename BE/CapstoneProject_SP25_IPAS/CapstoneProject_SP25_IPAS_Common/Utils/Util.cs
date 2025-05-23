﻿using CapstoneProject_SP25_IPAS_Common.Constants;
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

        public static List<string> SplitByDash(string input)
        {
            if (string.IsNullOrWhiteSpace(input))
            {
                return new List<string>();
            }

            return input.Split('-', StringSplitOptions.RemoveEmptyEntries)
                        .Select(s => s.Trim().ToLower())
                        .ToList();
        }

        public static List<int> ParseCommaSeparatedIntList(string? input)
        {
            if (string.IsNullOrWhiteSpace(input))
                return new List<int>();

            return input.Split(',')
                        .Select(x => int.TryParse(x.Trim(), out int value) ? value : (int?)null)
                        .Where(x => x.HasValue)
                        .Select(x => x!.Value)
                        .ToList();
        }

        public static bool IsImage(string? fileFormat)
       => !string.IsNullOrEmpty(fileFormat) && FileFormatConst.IMAGE_EXTENSIONS.Contains(fileFormat.ToLower());

        public static bool IsVideo(string? fileFormat)
            => !string.IsNullOrEmpty(fileFormat) && FileFormatConst.VIDEO_EXTENSIONS.Contains(fileFormat.ToLower());

        public static string ExtractJson(string response)
        {
            var startIndex = response.IndexOf('{');
            var endIndex = response.LastIndexOf('}');

            if (startIndex >= 0 && endIndex > startIndex)
            {
                return response.Substring(startIndex, endIndex - startIndex + 1);
            }

            return null!; 
        }
    }
}
