using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.UserBsModels
{
    public class UpdateFcmTokenModel
    {
        public string? Email { get; set; }

        public string? FcmToken { get; set; }
    }
}
