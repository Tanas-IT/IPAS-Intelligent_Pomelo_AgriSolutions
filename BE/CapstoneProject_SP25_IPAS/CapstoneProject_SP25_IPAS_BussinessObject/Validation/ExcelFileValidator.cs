using FluentValidation;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_BussinessObject.Validation
{
    public class ExcelFileValidator : AbstractValidator<IFormFile>
    {
        public ExcelFileValidator()
        {
            RuleFor(x => x.ContentType).NotNull().Must(x => x.Equals("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                                                         || x.Equals("application/vnd.ms-excel")
                                                         || x.Equals("application/octet-stream")
                                                         || x.Equals("text/csv"))
                .WithMessage("File type '.xlsx / .xlsm / .xlsb / .xlsx / .csv' are required");
        }
    }
}
