using CapstoneProject_SP25_IPAS_Common.Enum;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.BusinessModel.AuthensModel
{
    public class SignUpModel
    {
        [Required(ErrorMessage = "Email is required!"), EmailAddress(ErrorMessage = "Must be email format!")]
        [Display(Name = "Email address")]
        public string Email { get; set; } = "";
        [Required(ErrorMessage = "Password is required!")]
        [Display(Name = "Password")]
        public string Password { get; set; } = "";
        [Required(ErrorMessage = "Full name is required!")]
        [Display(Name = "Full name")]
        public string FullName { get; set; } = "";
        public string Gender { get; set; } = "";
        public string Phone { get; set; } = "";
        public DateTime Dob { get; set; } = new DateTime();

    }
}
