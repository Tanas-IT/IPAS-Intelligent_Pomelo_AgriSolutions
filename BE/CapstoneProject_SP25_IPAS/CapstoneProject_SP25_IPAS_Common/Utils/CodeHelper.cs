using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Common.Utils
{
    public static class CodeHelper
    {
        private static Random random = new Random();

        public static string GenerateCode()
        {
            // Lấy thời gian hiện tại
            var dateTimePart = DateTime.Now.ToString("yyyyddMMHHmmss").Substring(5, 9);

            // Tạo phần ngẫu nhiên
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var randomPart = new string(Enumerable.Repeat(chars, 4)
              .Select(s => s[random.Next(s.Length)]).ToArray());

            // Kết hợp GUID để tăng độ phức tạp
            var guidPart = Guid.NewGuid().ToString().ToUpper().Replace("-", "").Substring(0, 4);

            // Kết hợp tất cả
            //var productCode = randomPart + dateTimePart + guidPart;
            var productCode = randomPart  + guidPart;

            return productCode;
        }
        public static string ConvertTextToCode(string input, int length)
        {
            if (string.IsNullOrEmpty(input)) return "XX";

            // Loại bỏ dấu và ký tự không cần thiết
            input = RemoveDiacritics(input).ToUpper().Replace("-", "").Replace("'", "");

            // Tách các từ theo khoảng trắng
            var words = input.Split(new char[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);

            List<string> result = new List<string>();
            int currentLength = 0;

            // Lấy ký tự đầu tiên của mỗi từ
            int countLoop = words.Count();
            int loopIndex = 0;
            foreach (var word in words)
            {
                loopIndex++;
                int currentIndexInWord = 0;
                // Lấy ký tự đầu tiên của từ
                result.Add(word[currentIndexInWord].ToString());
                currentLength++;
                // Nếu chưa đủ độ dài, lấy thêm ký tự trong từ đó
                if (currentLength < length && word.Length > 1 && loopIndex == countLoop)
                {
                    currentIndexInWord++;
                    result.Add(word[currentIndexInWord].ToString());
                    currentLength++;
                }

                // Nếu đã đủ độ dài, dừng lại
                if (currentLength >= length)
                    break;
            }

            // Nối các ký tự lại với nhau và cắt bớt nếu cần
            string code = string.Join("", result).ToUpper();
            return code.Length >= length ? code.Substring(0, length) : code.PadRight(length, code.Last());
        }

        private static string RemoveDiacritics(string text)
        {
            var normalizedString = text.Normalize(System.Text.NormalizationForm.FormD);
            var stringBuilder = new System.Text.StringBuilder();

            foreach (var character in normalizedString)
            {
                if (System.Globalization.CharUnicodeInfo.GetUnicodeCategory(character) != System.Globalization.UnicodeCategory.NonSpacingMark)
                {
                    stringBuilder.Append(character);
                }
            }

            return stringBuilder.ToString().Normalize(System.Text.NormalizationForm.FormC);
        }
        private static string Base36Encode(int value)
        {
            const string chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            string result = "";
            while (value > 0)
            {
                result = chars[value % 36] + result;
                value /= 36;
            }
            return result.PadLeft(2, '0');
        }

        public static string GenerateGeoHash(double latitude, double longitude)
        {
            string input = $"{latitude},{longitude}";
            int hash = 0;

            foreach (char c in input)
            {
                hash = (hash * 31 + c) % 99999;
            }

            return Base36Encode(hash).PadLeft(6, '0');
        }
    }
}
