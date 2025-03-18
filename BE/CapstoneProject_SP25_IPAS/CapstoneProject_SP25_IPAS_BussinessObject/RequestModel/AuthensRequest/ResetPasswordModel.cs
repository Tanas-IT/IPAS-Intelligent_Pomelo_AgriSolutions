using System.ComponentModel.DataAnnotations;
using System.ComponentModel;
using Newtonsoft.Json;

namespace CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.AuthensRequest
{
    public class ResetPasswordModel
    {
        [Required(ErrorMessage = "Email is required!"), EmailAddress(ErrorMessage = "Must be email format!")]
        [Display(Name = "Email")]

        public string Email { get; set; } = "";

        [Required(ErrorMessage = "Password is required!")]
        [Display(Name = "NewPassword")]
        public string NewPassword { get; set; } = "";

        [StringLength(6)]
        [RegularExpression("^[0-9]*$", ErrorMessage = "Only numeric values are allowed.")]
        public string OtpCode { get; set; } = "";

    }
}
