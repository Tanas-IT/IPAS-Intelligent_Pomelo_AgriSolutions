using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.Payloads.Response
{
    public class RegisterSendOtpResponse
    {
        public string otpHash { get; set; }
    }
}
