﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.ReportModel
{
    public class TaskStatusDistribution
    {
        public int TotalTask { get; set; }
        public Dictionary<string, double>? TaskStatus { get; set; }
    }
}
