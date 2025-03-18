using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.ReportModel
{
    public class TasksByMonthModel
    {
        public string Month { get; set; }
        public int Completed { get; set; }
        public int Remained { get; set; }
    }

    public class TreeHealthStatus
    {
        public string Status { get; set; }
        public int Count { get; set; }
    }

    public class TreeNotes
    {
        public string NoteTaker { get; set; }
        public string TreeNotesCode { get; set; }
        public string Content { get; set; }
        public int PlantId { get; set; }
    }

    public class PlantHealthStatus
    {
        public string Status { get; set; }
        public int Count { get; set; }
    }
}
