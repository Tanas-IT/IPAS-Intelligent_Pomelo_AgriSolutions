using CapstoneProject_SP25_IPAS_Common.Enum;
using System.ComponentModel.DataAnnotations;

namespace CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.UserBsModels
{
    public class UpdateUserModel
    {
        public int UserId { get; set; }

        public string? Password { get; set; } = "";

        [Required(ErrorMessage = "Tên là bắt buộc")]
        [Display(Name = "Full name")]
        public string? FullName { get; set; } = null!;

        [Display(Name = "Phone Number")]
        [DataType(DataType.PhoneNumber, ErrorMessage = "Số điện thoại không hợp lệ")]
        [RegularExpression(@"^([0-9]{10})$", ErrorMessage = "Số điện thoại phải có 10 số")]
        public string? PhoneNumber { get; set; }
        public string? Status { get; set; }

        public string? Address { get; set; }

        public DateTime? Dob { get; set; }

        public string? Gender { get; set; }

        public string? AvatarURL { get; set; }
        public bool? IsDeleted { get; set; }

        public RoleEnum? Role { get; set; }


    }
}
