using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.Base
{
    public class BusinessResult : IBusinessResult
    {
        public int StatusCode { get; set; }
        public string? Message { get; set; }
        public object? Data { get; set; }

        public BusinessResult()
        {
            StatusCode = -1;
            Message = "Action fail";
        }

        public BusinessResult(int status, string message)
        {
            StatusCode = status;
            Message = message;
        }

        public BusinessResult(int status, string message, object data)
        {
            StatusCode = status;
            Message = message;
            Data = data;
        }
    }
    public class BusinessResult<T>
    {
        public int StatusCode { get; set; }
        public string Message { get; set; }
        public T Data { get; set; }
    }
}
