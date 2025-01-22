﻿using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_Common.Utils;
using CapstoneProject_SP25_IPAS_Service.BusinessModel.PartnerModel;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_Service.Payloads.Response;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Runtime.CompilerServices;

namespace CapstoneProject_SP25_IPAS_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PartnerController : ControllerBase
    {
        private readonly IPartnerService _partnerService;

        public PartnerController(IPartnerService partnerService)
        {
            _partnerService = partnerService;
        }

        [HttpGet(APIRoutes.Partner.getPartnerWithPagination, Name = "getPartnerWithPagination")]
        public async Task<IActionResult> GetAllPartner(PaginationParameter paginationParameter)
        {
            try
            {
                var result = await _partnerService.GetAllPartnerPagination(paginationParameter);
                return Ok(result);
            }
            catch (Exception ex)
            {
                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }

        [HttpGet(APIRoutes.Partner.getPartnerById, Name = "getPartnerById")]
        public async Task<IActionResult> GetPartnerById([FromRoute] int id)
        {
            try
            {
                var result = await _partnerService.GetPartnerByID(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }

        [HttpPost(APIRoutes.Partner.createPartner, Name = "createPartner")]
        public async Task<IActionResult> CreateaPartner(CreatePartnerModel createPartnerModel)
        {
            try
            {
                var result = await _partnerService.CreatePartner(createPartnerModel);
                return Ok(result);
            }
            catch (Exception ex)
            {
                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }

        [HttpPut(APIRoutes.Partner.updatePartnerInfo, Name = "updatePartnerInfo")]
        public async Task<IActionResult> UpdatePartner(UpdatePartnerModel updatePartnerModel)
        {
            try
            {
                var result = await _partnerService.UpdatePartnerInfo(updatePartnerModel);
                return Ok(result);
            }
            catch (Exception ex)
            {
                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }

        [HttpDelete(APIRoutes.Partner.permanenlyDelete, Name = "permanentlyDeletePartner")]
        public async Task<IActionResult> DeletePartner([FromRoute] int id)
        {
            try
            {
                var result = await _partnerService.PermanentlyDeletePartner(id);
                return Ok(result);
            }
            catch (Exception ex)
            {
                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }

        [HttpGet(APIRoutes.Partner.getPartnerByRoleName, Name = "getPartnerByRoleName")]
        public async Task<IActionResult> GetPartnerByRoleName([FromRoute] string roleName)
        {
            try
            {
                var result = await _partnerService.GetPartnerByRoleName(roleName);
                return Ok(result);  
            }
            catch (Exception ex)
            {
                var response = new BaseResponse()
                {
                    StatusCode = StatusCodes.Status400BadRequest,
                    Message = ex.Message
                };
                return BadRequest(response);
            }
        }
    }
}
