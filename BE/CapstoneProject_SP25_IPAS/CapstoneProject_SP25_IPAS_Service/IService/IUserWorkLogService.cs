using CapstoneProject_SP25_IPAS_BussinessObject.BusinessModel.UserWorkLogModel;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.IService
{
    public interface IUserWorkLogService
    {
        public Task<BusinessResult> CheckUserConflictSchedule(CheckConflictScheduleModel checkConflictScheduleModel);
        public Task<BusinessResult> CheckUserConflictByStartDateAndEndDate(CheckConflictScheduleByStartDateAndEndDateModel checkConflictScheduleByStartDateAndEndDate);
    }
}
