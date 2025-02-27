using AutoMapper;
using CapstoneProject_SP25_IPAS_BussinessObject.Entities;
using CapstoneProject_SP25_IPAS_Repository.UnitOfWork;
using CapstoneProject_SP25_IPAS_Service.Base;
using CapstoneProject_SP25_IPAS_Service.IService;
using ProjNet.CoordinateSystems;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CapstoneProject_SP25_IPAS_Service.Service
{
    public class PaymentService : IPaymentService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public PaymentService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public Task<BusinessResult> CreatePayment()
        {
            throw new NotImplementedException();
        }

        public Task<BusinessResult> GetAllPaymentOfOrder(int OrderId)
        {
            throw new NotImplementedException();
        }

        public Task<BusinessResult> UpdatePayment()
        {
            throw new NotImplementedException();
        }
    }
}
