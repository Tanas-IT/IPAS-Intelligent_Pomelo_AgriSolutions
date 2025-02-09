using CapstoneProject_SP25_IPAS_API.Payload;
using CapstoneProject_SP25_IPAS_BussinessObject.RequestModel.FarmRequest.CriteriaRequest;
using CapstoneProject_SP25_IPAS_Service.IService;
using CapstoneProject_SP25_IPAS_BussinessObject.Payloads.Response;
using CapstoneProject_SP25_IPAS_Service.Service;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CapstoneProject_SP25_IPAS_API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CriteriaController : ControllerBase
    {
        private readonly ICriteriaService _criteriaService;

        public CriteriaController(ICriteriaService criteriaService)
        {
            _criteriaService = criteriaService;
        }

        [HttpGet(APIRoutes.Criteria.getCriteriaById + "/{criteria-id}", Name = "getCriteriaById")]
        public async Task<IActionResult> GetCriteriaById([FromRoute(Name = "criteria-id")] int id)
        {
            try
            {
                var result = await _criteriaService.GetCriteriaById(id);
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

        [HttpPut(APIRoutes.Criteria.updateCriteriaInfo, Name = "updateCriteria")]
        public async Task<IActionResult> UpdateCriteria(CriteriaUpdateRequest updateRequest)
        {
            try
            {
                var result = await _criteriaService.UpdateOneCriteriaInType(updateRequest);
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

        [HttpPut(APIRoutes.Criteria.updateListCriteriaType, Name = "updateListCriteria")]
        public async Task<IActionResult> UpdateListCriteria([FromBody]ListCriteriaUpdateRequest request)
        {
            try
            {
                var result = await _criteriaService.UpdateListCriteriaInType(request);
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

        [HttpGet(APIRoutes.Criteria.getCriteriaOfPlantById + "/{plant-id}", Name = "getCriteriaOfPlantById")]
        public async Task<IActionResult> GetCriteriaOfPlantById([FromRoute(Name = "plant-id")] int id)
        {
            try
            {
                var result = await _criteriaService.GetCriteriaOfPlant(id);
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
