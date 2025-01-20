﻿using System;
using System.Collections.Generic;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities;

public partial class LandPlotCoordination
{
    public int LandPlotCoordinationId { get; set; }
    public double? Longitude { get; set; }

    public double? Lagtitude { get; set; }

    public int? LandPlotId { get; set; }

    public virtual LandPlot? LandPlot { get; set; }
}
