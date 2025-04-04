using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.WorkLogRequest;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.HarvestHistoryRequest
{
    public class CreateHarvestHistoryRequest
    {
        [Required]
        public DateTime? DateHarvest { get; set; }

        public string? HarvestHistoryNote { get; set; }

        //public double? TotalPrice { get; set; }
        [Required]
        public int CropId { get; set; }

        public ICollection<CreateProductHarvestWoutPlantID> ProductHarvestHistory { get; set; } = new List<CreateProductHarvestWoutPlantID>();

        public AddNewTaskModel AddNewTask { get; set; } = new AddNewTaskModel();
    }

}
