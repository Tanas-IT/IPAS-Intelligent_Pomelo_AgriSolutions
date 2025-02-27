using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.PackageRequest;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.IService
{
    public interface IOrderService
    {
        public Task<BusinessResult> GetOrdersOfFarm(int farmId, PaginationParameter paginationParameter);
        public Task<BusinessResult> GetOrderExpiredOfFarm(int farmId);
        public Task<BusinessResult> CreateOrder(OrderCreateRequest createRequest);
        public Task<BusinessResult> UpdateOrder(UpdateOrderRequest updateRequest);
    }
}
