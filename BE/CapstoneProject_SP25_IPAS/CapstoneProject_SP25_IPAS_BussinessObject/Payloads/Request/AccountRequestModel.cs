using System.ComponentModel.DataAnnotations;
using System.ComponentModel;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Request
{
    public class AccountRequestModel
    {
        [Required(ErrorMessage = "Email is required"), EmailAddress(ErrorMessage = "Must be email format!")]
        [DisplayName("Email Address")]
        public string Email { get; set; } = "";

        [Required]
        [DisplayName("Password")]
        public string Password { get; set; } = "";
    }
}
