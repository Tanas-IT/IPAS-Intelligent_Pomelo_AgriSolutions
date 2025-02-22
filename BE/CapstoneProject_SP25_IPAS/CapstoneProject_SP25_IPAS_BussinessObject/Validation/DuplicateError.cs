using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Validation
{
    public class DuplicateError<T>
    {
        public List<int> RowIndexes { get; set; } = new List<int>(); // Số thứ tự dòng bị trùng
        public string DuplicateType { get; set; } = ""; // "Excel" hoặc "Database"
        public List<T> DuplicateItems { get; set; } = new List<T>(); // Danh sách object bị trùng
    }
}
