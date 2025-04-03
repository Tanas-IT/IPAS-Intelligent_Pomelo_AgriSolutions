using System;
using System.Collections.Generic;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Entities;

public partial class GraftedPlantNote
{
    public int GraftedPlantNoteId { get; set; }

    public string? GraftedPlantNoteCode { get; set; }

    public string? IssueName { get; set; }

    public string? Content { get; set; }

    //public string? Image { get; set; }

    //public string? NoteTaker { get; set; }

    public int? GraftedPlantId { get; set; }

    public DateTime? CreateDate { get; set; }

    public DateTime? UpdateDate { get; set; }
    public int? UserId { get; set; }
    public virtual ICollection<Resource> Resources { get; set; } = new List<Resource>();
    public virtual GraftedPlant? GraftedPlant { get; set; }
    public virtual User? User { get; set; }
}
