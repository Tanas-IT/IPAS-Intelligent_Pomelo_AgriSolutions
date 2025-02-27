using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Service.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.IService
{
    public interface IPaymentService
    {
        //public Task AddPaymentToOrder(Order orderEntity);
        public Task<BusinessResult> GetAllPaymentOfOrder(int OrderId);
        public Task<BusinessResult> UpdatePayment();
        public Task<BusinessResult> CreatePayment();
    }
}
