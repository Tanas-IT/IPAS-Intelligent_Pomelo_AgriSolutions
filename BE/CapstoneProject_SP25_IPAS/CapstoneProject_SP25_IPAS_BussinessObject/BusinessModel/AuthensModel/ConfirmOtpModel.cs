using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.AuthensModel
{
    public class ConfirmOtpModel
    {
        [Required(ErrorMessage = "Email is required!"), EmailAddress(ErrorMessage = "Must be email format!")]
        [Display(Name = "Email")]

        public string Email { get; set; } = "";

        [StringLength(6)]
        [RegularExpression("^[0-9]*$", ErrorMessage = "Only numeric values are allowed.")]
        public string OtpCode { get; set; } = "";
    }
}
