using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Validation
{
    public class FlexibleTimeAttribute : ValidationAttribute
    {
        public override bool IsValid(object? value)
        {
            if (value is not string timeStr || string.IsNullOrWhiteSpace(timeStr))
                return true; // Allow null or empty

            // Normalize the time string to 24-hour format (HH:mm:ss)
            var normalizedTime = NormalizeTo24HourFormat(timeStr);

            if (normalizedTime == null)
            {
                return false; // Invalid time format
            }

            // Set the normalized time to the value (you can use this normalized value further in the service)
            value = normalizedTime;
            return true;
        }

        public static string? NormalizeTo24HourFormat(string? timeStr)
        {
            if (string.IsNullOrWhiteSpace(timeStr)) return null;

            // Try parsing as TimeSpan (24-hour format: HH:mm:ss)
            if (TimeSpan.TryParse(timeStr, out var ts))
                return ts.ToString(@"hh\:mm\:ss");

            if (DateTime.TryParseExact(timeStr, new[] { "h:mm:ss tt", "hh:mm:ss tt" }, CultureInfo.InvariantCulture, DateTimeStyles.None, out var dt))
                return dt.ToString("HH:mm:ss"); // Normalize to 24-hour format

            return null; // Invalid time
        }

        public override string FormatErrorMessage(string name)
        {
            return $"{name} must be a valid time in HH:mm:ss (e.g., 14:30:00) or hh:mm:ss tt (e.g., 02:30:00 PM) format.";
        }
    }
}
