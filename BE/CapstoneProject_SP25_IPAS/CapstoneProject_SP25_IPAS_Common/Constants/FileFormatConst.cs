using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Common.Constants
{
    public static class FileFormatConst
    {
        public static readonly List<string> IMAGE_EXTENSIONS = new() { "jpg", "jpeg", "png", "gif", "bmp", "tiff", "webp" };
        public static readonly List<string> VIDEO_EXTENSIONS = new() { "mp4", "avi", "mov", "wmv", "flv", "mkv", "webm" };

        public static string IMAGE = "image";
        public static string VIDEO = "video";

        public static string CSV_EXPAND = ".csv";
        public static string CSV_FILENAME_EMPTY = "empty.csv";
        public static string CSV_CONTENT_TYPE = "text/csv";
    }
}
